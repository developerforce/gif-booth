const express = require("express");
const ffmpeg = require('fluent-ffmpeg');
const cloudinary = require('./cloudinary');/*  console.log(cloudinary); */
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.set("port", process.env.PORT || 3001);
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'video',
    format: async (req, file) => {
      const on = file.originalname.split('.');
      const format = on[on.length - 1];
      return format;
    },
    resource_type: 'video',
    transformation: [
      { duration: 3.0 }
    ]
  },
});
const upload = multer({ storage });

app.post('/uploadVideo', upload.single('video'), ({file}, res) => {
  res.send(file);
});

app.post('/uploadImage', ({body}, res) => {
  const { filename } = body;
  const path = `temp/${filename}.gif`;
  cloudinary.uploader.upload(path, (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

app.post('/video2gif', upload.none(), ({body}, res) => {
  const { videoUrl, videoId } = body;
  ffmpeg()
  .input(videoUrl)
  .outputOption("-vf", "scale=320:-1:flags=lanczos,fps=15")
  //.outputOption("-vf", "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse") //better quality, bigger file
  .on('end', () => {
    //console.log('res: ', body);
    res.send(body);
  })
  .on('error', (err) => {
    console.log('an error happened: ' + err.message);
    res.send(err);
  })
  .on('progress', (progress) => {
    console.log('Processing: ' + progress.percent + '% done');
  })
  .save(`temp/${videoId}.gif`);
});

app.get('/img', (req, res) => {
  const { filename } = req.query;
  const path = `temp/${filename}.gif`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const ext = filename.split("/").pop();
  const head = {
    'Content-Length': fileSize,
    'Content-Type': `image/${ext}`
  }
  res.writeHead(200, head);
  fs.createReadStream(path).pipe(res);
});

app.get('/download', (req, res) => {
  const { filename } = req.query;
  const path = `temp/${filename}.gif`;
  res.download(path, (err) => {  
    if (err) console.log(err);
    console.log('Your file has been downloaded!');
    fs.unlink(path, () => {
      console.log("File was deleted");
    });
  });
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`);
});