const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');

const fetchImg = async (url) => {
  try {
    const res = await axios({
      url,
      responseType: 'arraybuffer',
    });
    return res;
  } catch (e) {
    return null;
  }
};

const chunkArray = (array, size) => {
  if (!array) return [];
  const firstChunk = array.slice(0, size);
  if (!firstChunk.length) return array;
  return [firstChunk].concat(chunkArray(array.slice(size, array.length), size));
};

const fetchImgs = async (imgs) => {
  const fetched = await Promise.all(imgs.map(fetchImg));
  return fetched.filter((img) => img !== null);
};

const createLayout = (imgs) => {
  const aspectRatio = 1 + 1 / 3; // width / height (is determined by actual size of webcam element in the FE)

  const count = imgs.length;

  const idealGridWidth = 2000;
  const rowCount = Math.ceil(Math.sqrt(count));

  const chunkedImgs = chunkArray(imgs, rowCount);
  const colCount = chunkedImgs.length;

  const imgWidth = Math.round(idealGridWidth / rowCount); // these need to be an integer
  const imgHeight = Math.round(imgWidth / aspectRatio);

  const gridWidth = imgWidth * rowCount;
  const gridHeight = colCount * imgHeight;

  let top = 0;
  const imgMap = chunkedImgs.map((row) => {
    let left = 0;
    const rowMap = row.map((img) => {
      const imgSpecs = {
        top: 0,
        left,
        width: imgWidth,
        height: imgHeight,
        img,
      };

      left = left + imgWidth;

      return imgSpecs;
    });

    const rowSpecs = {
      top,
      left: 0,
      width: imgWidth * row.length,
      height: imgHeight,
      imgs: rowMap,
    };

    top = top + imgHeight;

    return rowSpecs;
  });

  return {
    height: gridHeight,
    width: gridWidth,
    rowCount,
    imgWidth,
    imgHeight,
    imgMap,
  };
};

const createGroupPhoto = async (urls) => {
  const padding = 16;
  const brandingHeight = 80;
  const conferenceOutputPath = './temp/conference_logo.png';

  const imgs = await fetchImgs(urls);

  const { width, height, imgMap } = createLayout(imgs);

  await sharp('./uploads/CascadiaJSLong.png')
    .resize(null, brandingHeight)
    .toFile(conferenceOutputPath);
  const imgLogo = await sharp(conferenceOutputPath);
  const logoMetadata = await imgLogo.metadata();

  const totalWidth = width + padding * 2;
  const totalHeight = height + logoMetadata.height + padding * 3;

  const inputs = await Promise.all(
    imgMap.map(async (row) => {
      const inputs = await Promise.all(
        row.imgs.map(async (img) => {
          const toSizedBuffer = (frame) =>
            frame.resize(img.width, img.height).raw().toBuffer();
          let inputFrame;
          let firstFrame = await sharp(img.img.data);
          try {
            const { pages } = await firstFrame.metadata();
            const page = Math.round(pages / 2) || 0;
            middleFrame = await sharp(img.img.data, { page });
            inputFrame = await toSizedBuffer(middleFrame);
          } catch (e) {
            console.log(
              'Failed to resize and convert middle frame to buffer, defaulting to first frame.',
              { url: img.img.config.url },
            );
            inputFrame = await toSizedBuffer(firstFrame);
          }

          return {
            input: inputFrame,
            raw: { width: img.width, height: img.height, channels: 4 },
            top: img.top,
            left: img.left,
          };
        }),
      );

      const rowInput = await sharp({
        create: {
          height: row.height,
          width: row.width,
          background: '#FFF',
          channels: 3,
        },
      })
        .composite(inputs)
        .raw()
        .toBuffer();

      return {
        input: rowInput,
        raw: { width: row.width, height: row.height, channels: 4 },
        top: row.top + padding,
        left: row.left + padding,
      };
    }),
  );

  const groupPhoto = await sharp({
    create: {
      height: totalHeight,
      width: totalWidth,
      channels: 3,
      background: 'white',
    },
  }).composite([
    {
      input: {
        create: {
          height,
          width,
          background: '#EDF2F7',
          channels: 3,
        },
      },
      top: padding,
      left: padding,
    },
    ...inputs,
    {
      input: conferenceOutputPath,
      top: height + padding * 2,
      left: Math.floor(totalWidth / 2 - logoMetadata.width / 2),
    },
  ]);

  return groupPhoto;
};

const createGroupPhotoStream = async (urls) => {
  try {
    const groupPhoto = await createGroupPhoto(urls);
    console.log('Group Photo Processed');
    const png = await groupPhoto.png({
      compressionLevel: 5,
      quality: 100,
    });
    await png.toFile('./temp/group-photo.png');
    console.log('Group Photo Output to /temp');
    return fs.createReadStream('./temp/group-photo.png');
  } catch (e) {
    console.log(e);
  }
};

module.exports = { createGroupPhotoStream };
