const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');

const fetchImg = (url) =>
  axios({
    url,
    responseType: 'arraybuffer',
  });

const fetchImgs = (imgs) => Promise.all(imgs.map(fetchImg));

const createLayout = (urls) => {
  const aspectRatio = 1 + 1 / 3; // width / height (is determined by actual size of webcam element in the FE)

  const count = urls.length;

  const gridWidth = 1200;
  let gridLength = Math.ceil(Math.sqrt(count));

  const imgWidth = gridWidth / gridLength;
  const imgHeight = imgWidth / aspectRatio;

  const gridHeight = Math.ceil(count / gridLength) * imgHeight;

  let top = 0;
  let left = 0;

  const imgMap = urls.map(() => {
    const specs = { top, left, width: imgWidth, height: imgHeight };
    left = left + imgWidth;
    if (left === imgWidth * gridLength) {
      left = 0;
      top = top + imgHeight;
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
    create: { height, width, channels: 4, background: '#EDF2F7' },
  }).composite(inputs);

  return stitched;
};

const addBranding = async (contentImg) => {
  const padding = 16;
  const brandingHeight = 80;
  const conferenceOutputPath = './temp/conference_logo.png';

  const contentMetadata = await contentImg.metadata();
  const contentInput = await contentImg.raw().toBuffer();

  await sharp('./uploads/CascadiaJS.png')
    .resize(null, brandingHeight)
    .toFile(conferenceOutputPath);
  const imgLogo = await sharp(conferenceOutputPath);
  const logoMetadata = await imgLogo.metadata();

  const brandedWidth = contentMetadata.width + padding * 2;

  const branded = await sharp({
    create: {
      width: brandedWidth,
      height: contentMetadata.height + logoMetadata.height + padding * 3,
      channels: 4,
      background: 'white',
    },
  }).composite([
    {
      input: contentInput,
      raw: {
        width: contentMetadata.width,
        height: contentMetadata.height,
        channels: 4,
      },
      top: padding,
      left: padding,
    },
    {
      input: conferenceOutputPath,
      top: contentMetadata.height + padding * 2,
      left: Math.floor(brandedWidth / 2 - logoMetadata.width / 2),
    },
  ]);

  return branded;
};

const createGroupPhotoStream = async (urls) => {
  const stitched = await stitchImgs(urls);
  const groupPhoto = await addBranding(stitched);
  await groupPhoto.toFile('./temp/group-photo.png');
  return fs.createReadStream('./temp/group-photo.png');
};

module.exports = { createGroupPhotoStream };
