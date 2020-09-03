if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const basicAuth = require('express-basic-auth');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const config = require('../config');
const { createGroupPhotoStream } = require('./utils/group-photo');

const makeFileLocation = (file) => `${config.AWS_BUCKET_URL}/${file.Key}`;

const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
});

const auth = basicAuth({
  users: {
    [config.AUTH_USERNAME]: config.AUTH_PASSWORD,
  },
});

const app = express();
app.set('port', process.env.PORT || 3001);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    let filename = `${Date.now()}.${file.originalname.split('.')[1]}`;
    if (req.path === '/uploadBlob') {
      filename = `${Date.now()}.webm`;
    }
    cb(null, filename);
  },
});

const upload = multer({ storage });

const GREETING_PREFIX = 'public/gifs/greeting-';

const listGifs = async () => {
  try {
    const params = {
      Bucket: config.AWS_BUCKET_NAME,
      Prefix: GREETING_PREFIX,
    };

    const getAllContents = async (PrevContents = [], NextContinuationToken) => {
      const result = await s3
        .listObjectsV2({
          ...params,
          ...(NextContinuationToken
            ? { ContinuationToken: NextContinuationToken }
            : {}),
        })
        .promise();
      const Contents = [...PrevContents, ...result.Contents];
      return result.NextContinuationToken
        ? getAllContents(Contents, result.NextContinuationToken)
        : Contents;
    };

    const Contents = await getAllContents();

    const OrderedContents = Contents.map((file) => ({
      ...file,
      Location: makeFileLocation(file),
    })).reverse();

    return OrderedContents;
  } catch (e) {
    console.log(e);
  }
};

app.get('/listGifs', async (_, res) => {
  const result = await listGifs();
  res.send(result);
});

const groupPhotoPath = 'public/group_photo.png';

app.post('/getGroupPhoto', async (_, res) => {
  const params = {
    Bucket: config.AWS_BUCKET_NAME,
    Prefix: groupPhotoPath,
  };
  const result = await s3.listObjects(params).promise();
  result.Contents = result.Contents.map((file) => ({
    ...file,
    Location: makeFileLocation(file),
  }));
  res.send(result);
});

app.post('/createGroupPhoto', async (_, res) => {
  const result = await listGifs();
  try {
    const urls = result.map((file) => makeFileLocation(file));
    const stream = await createGroupPhotoStream(urls);
    const params = {
      Key: groupPhotoPath,
      Bucket: config.AWS_BUCKET_NAME,
      Body: stream,
      ContentType: 'image/png',
      ACL: 'public-read',
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        data.LastModified = Date.now();
        res.send(data);
      }
    });
  } catch (e) {
    console.log(e);
  }
});

const uploadGIF = async (res, filename, folderName, onSuccess) => {
  const path = `${folderName}/${filename}.gif`;
  const fileStream = fs.createReadStream(path);

  const params = {
    Key: `${GREETING_PREFIX}${Date.now()}.gif`,
    Bucket: config.AWS_BUCKET_NAME,
    Body: fileStream,
    ContentType: 'image/gif',
    ACL: 'public-read',
  };

  await s3
    .upload(params)
    .promise()
    .then((data) => {
      console.log('s3.upload', data);
      res.send(data);
      fs.unlink(path, () => console.log(`${path} was deleted after upload`));
      if (onSuccess) onSuccess();
    })
    .catch((e) => {
      console.log(e, e.stack);
      res.status(500).send(e);
    });
};

app.post('/uploadUserGIF', upload.single('gif'), async (req, res) => {
  const gif = req.file;
  if (!gif) {
    res.status(400).send({
      status: false,
      data: 'No file is selected.',
    });
  } else {
    const filename = gif.filename.replace('.gif', '');
    uploadGIF(res, filename, 'uploads');
  }
});

app.post('/uploadGIF', ({ body }, res) => {
  const { filename } = body;
  uploadGIF(res, filename, 'temp', () => {
    fs.unlink(`uploads/${filename}.webm`, () =>
      console.log('.webm file was deleted'),
    );
    fs.unlink(`uploads/${filename}.png`, () =>
      console.log('.png file was deleted'),
    );
  });
});

app.post('/video2gif', upload.none(), ({ body }, res) => {
  const { videoId, text, fontsize } = body;
  ffmpeg()
    .input(`uploads/${videoId}.webm`)
    .input('uploads/CascadiaJS.png')
    .complexFilter([
      '[1]scale=iw*1:-1[a]',
      '[0][a]overlay=x=20:y=20[b]',
      '[b]scale=320:-1:flags=lanczos,fps=15[c]',
      {
        filter: 'drawtext',
        options: {
          text: text.replace(/\r?\n|\r/gm, '\v'),
          fontsize,
          fontcolor: 'white',
          x: '(w-text_w)/2',
          y: '(h-text_h)*.95',
          shadowcolor: 'black',
          shadowx: 2,
          shadowy: 2,
        },
        inputs: 'c',
      },
    ])
    .on('end', () => {
      res.send(body);
    })
    .on('error', (err) => {
      console.log('an error happened: ' + err.message);
      res.send(err);
    })
    .save(`temp/${videoId}.gif`);
});

app.post('/uploadBlob', upload.single('video'), ({ file }, res) => {
  const filename = file.path.replace('webm', 'png');
  ffmpeg(file.path)
    .screenshots({
      timestamps: [0],
      filename,
      size: '320x240',
    })
    .on('end', () => {
      res.send(file);
    });
});

app.get('/img', (req, res) => {
  const { filename } = req.query;
  const path = `temp/${filename}.gif`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const ext = filename.split('/').pop();
  const head = {
    'Content-Length': fileSize,
    'Content-Type': `image/${ext}`,
  };
  res.writeHead(200, head);
  fs.createReadStream(path).pipe(res);
});

app.get('/download', (req, res) => {
  const { filename } = req.query;
  const path = `temp/${filename}.gif`;
  res.download(path, (err) => {
    if (err) console.log(err);
    console.log('Your file has been downloaded!');
  });
});

app.get('/s3-download', async (req, res) => {
  const { filename } = req.query;
  const params = {
    Bucket: config.AWS_BUCKET_NAME,
    Key: filename,
  };
  s3.getObject(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else {
      res.send(data.Body);
    }
  });
});

app.delete('/deleteObj', auth, ({ body }, res) => {
  const { filename } = body;
  const params = {
    Bucket: config.AWS_BUCKET_NAME,
    Key: filename,
  };
  s3.deleteObject(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else res.send(data);
  });
});

app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/*', (req, res) =>
  res.sendFile(path.join(__dirname, '../client/build', 'index.html')),
);

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});
