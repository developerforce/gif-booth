const express = require("express");
const ffmpeg = require('fluent-ffmpeg');
const cloudinary = require('./cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.set("port", process.env.PORT || 3001);
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/new-gif', (req, res) => res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = new CloudinaryStorage({
  cloudinary,
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

const storage2 = multer.diskStorage({ 
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => { //console.log(file);
    const filename = `${Date.now()}.webm`;
    cb(null, filename)
  }
});
const upload2 = multer({ storage: storage2 });

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

app.get('/all-gifs', (req, res) => {
  let params = { type: "upload", max_results: 12 };
  const { next_cursor } = req.query;
  if (next_cursor) params = { ...params, next_cursor };
  cloudinary.api.resources(params, (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

app.post('/video2gif', upload.none(), ({body}, res) => {
  const { videoId } = body;
  ffmpeg()
  .input(`uploads/${videoId}.webm`)
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
  .save(`temp/${videoId}.gif`);
});

app.post('/uploadBlob', upload2.single('video'), ({file}, res) => { //console.log('file: ', file);
  const filename = file.path.replace('webm', 'png');
  ffmpeg(file.path)
  .screenshots({
    timestamps: [0],
    filename,
    size: '320x240'
  })
  .on('end', () => { //console.log('Screenshot taken');
    res.send(file);
  });
});

app.get('/video', (req, res) => { //console.log('body: ', req.body);
  const { filename } = req.query;
  const path = `uploads/${filename}`; //console.log('path: ', path);
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) { //console.log('range: ', range);
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(path, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/webm'
    }

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/webm',
    }
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
})

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

app.get('/poster', (req, res) => {
  const { filename } = req.query;
  const path = `uploads/${filename}`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const head = {
    'Content-Length': fileSize,
    'Content-Type': `image/png`
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
    fs.unlink(path, () => console.log("File was deleted"));
  });
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`);
});