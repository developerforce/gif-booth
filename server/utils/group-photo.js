const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');

const fetchImgs = (imgs) =>
  Promise.all(
    imgs.map((url) =>
      axios({
        url,
        responseType: 'arraybuffer',
      })
    )
  );

const createLayout = (urls) => {
  const aspectRatio = 1 + 1 / 3; // width / height

  const count = urls.length;

  const gridWidth = 1200;
  const gridLength = Math.ceil(Math.sqrt(count));
  const remainingGridLength = count % 5;

  const imgWidth = gridWidth / gridLength;
  const imgHeight = imgWidth / aspectRatio;
  const remainingImgWidth = gridWidth / remainingGridLength;
  const remainingImgHeight = remainingImgWidth / aspectRatio;

  const gridHeight =
    remainingGridLength > 0
      ? (gridLength - 1) * imgHeight + remainingImgHeight
      : gridLength * imgHeight;

  let top = 0;
  let left = 0;

  const imgMap = urls.map((_, i) => {
    const isRemaining = i + 1 > count - remainingGridLength;
    const width = isRemaining ? remainingImgWidth : imgWidth;
    const height = isRemaining ? remainingImgHeight : imgHeight;
    const specs = { top, left, width, height };
    left = left + width;
    if (left === width * gridLength) {
      left = 0;
      top = top + height;
    }
    return specs;
  });

  return {
    height: gridHeight,
    width: gridWidth,
    imgMap,
  };
};

const stitchImgs = async (urls) => {
  const { width, height, imgMap } = createLayout(urls);

  const imgs = await fetchImgs(urls);

  const inputs = await Promise.all(
    imgs.map(async (img, i) => {
      const { top, left, width, height } = imgMap[i];
      const loaded = await sharp(img.data);
      const input = await loaded.resize(width, height).raw().toBuffer();
      return {
        input,
        raw: { width, height, channels: 4 },
        top,
        left,
      };
    })
  );

  const stitched = await sharp({
    create: { height, width, channels: 3, background: 'black' },
    animated: true,
  }).composite(inputs);

  return stitched;
};

const createGroupPhotoStream = async (urls) => {
  const stitched = await stitchImgs(urls);
  await stitched.toFile('./temp/group-photo.png');
  return fs.createReadStream('./temp/group-photo.png');
};

module.exports = { createGroupPhotoStream };
