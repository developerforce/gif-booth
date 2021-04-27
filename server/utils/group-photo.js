const sharp = require('sharp')
const axios = require('axios')
const fs = require('fs')
const mergeImg = require('merge-img')

const fetchImg = async (url) => {
  try {
    const res = await axios({
      url,
      responseType: 'arraybuffer',
    })
    return res
  } catch (e) {
    return null
  }
}

const fetchImgs = async (imgs) => {
  const fetched = await Promise.all(imgs.map(fetchImg))
  return fetched.filter((img) => img !== null)
}

const createGroupPhoto = async (urls) => {
  const imgs = await fetchImgs(urls)
  const imgBuffers = imgs.map((img) => {
    return sharp(img.data)
      .jpeg({
        quality: 75,
      })
      .toBuffer()
  })

  return Promise.all(imgBuffers).then((imgBuffer) => {
    return mergeImg(imgBuffer).then((img) => img)
  })
}

const outputPath = './temp/group-photo.jpeg'

const createGroupPhotoStream = async (urls) => {
  try {
    const groupPhoto = await createGroupPhoto(urls)
    console.log('Group Photo Processed')
    await groupPhoto.write(outputPath)
    console.log(`Group Photo Output to ${outputPath}`)
    return fs.createReadStream(outputPath)
  } catch (e) {
    console.log(e)
    return null
  }
}

module.exports = { createGroupPhotoStream }
