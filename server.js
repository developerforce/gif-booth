const express = require("express");
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const s3  = new AWS.S3({
  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

const app = express();
app.set("port", process.env.PORT || 3001);
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/new-gif', (req, res) => res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({ 
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}.webm`;
    cb(null, filename)
  }
});
const upload = multer({ storage });

app.post('/uploadImage', ({body}, res) => {
  const { filename } = body;
  const path = `temp/${filename}.gif`;
  const fileStream = fs.createReadStream(path);
  const params = {
    Key: `${filename}.gif`,
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Body: fileStream,
    ContentType: 'image/gif',
    ACL: 'public-read'
  };
  
  s3.upload(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return;
    } else {
      console.log("s3.upload", data);
    }
  });
});

app.get('/all-gifs', (req, res) => {
  const params = {
    Bucket : process.env.BUCKETEER_BUCKET_NAME
  };
  s3.listObjects(params, (err, result) => {
    if (err) {
      console.log("Error", err);
    } else {
      res.send(result);
    }
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

app.post('/uploadBlob', upload.single('video'), ({file}, res) => {
  const filename = file.path.replace('webm', 'png');
  ffmpeg(file.path)
  .screenshots({
    timestamps: [0],
    filename,
    size: '320x240'
  })
  .on('end', () => {
    res.send(file);
  });
});

app.get('/video', (req, res) => {
  const { filename } = req.query;
  const path = `uploads/${filename}`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
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

app.get('/s3-download', async (req, res) => {
  const { filename } = req.query;
  const params = {
    Bucket : process.env.BUCKETEER_BUCKET_NAME,
    Key: filename
  };
  s3.getObject(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else { console.log("get file", data);
      res.send(data.Body)
    }
  });
});

app.delete('/deleteObj', ({body}, res) => {
  const { filename } = body;
  const params = {
    Bucket : process.env.BUCKETEER_BUCKET_NAME,
    Key: filename
  };
  s3.deleteObject(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else res.send(data);
  });
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`);
});