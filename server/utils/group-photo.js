const sharp = require('sharp')
const axios = require('axios')
const fs = require('fs')

const chunkArray = (array, size) => {
  if (!array) return []
  const firstChunk = array.slice(0, size)
  if (!firstChunk.length) return array
  return [firstChunk].concat(chunkArray(array.slice(size, array.length), size))
}

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

const createImageLayout = (imgs) => {
  const aspectRatio = 1 + 1 / 3

  const count = imgs.length

  const idealGridWidth = 2000
  const rowCellCount = Math.ceil(Math.sqrt(count))
  const colCellCount = Math.ceil(count / rowCellCount)

  const imgWidth = Math.round(idealGridWidth / rowCellCount) // these need to be an integer
  const imgHeight = Math.round(imgWidth / aspectRatio)

  const gridWidth = imgWidth * rowCellCount
  const gridHeight = imgHeight * colCellCount

  let top = 0
  let left = 0
  const _imgs = imgs.map((img) => {
    const specs = {
      data: img,
      top,
      left,
      width: imgWidth,
      height: imgHeight,
    }

    left += imgWidth
    if (left >= gridWidth) {
      left = 0
      top += imgHeight
    }

    return specs
  })

  return {
    imgs: _imgs,
    height: gridHeight,
    width: gridWidth,
    imgWidth,
    imgHeight,
    rowCellCount,
    colCellCount,
  }
}

const compositeGif = async (buffer, { width, height, top, left, id }) => {
  const toSizedBuffer = (frame) => frame.resize(width, height).raw().toBuffer()

  let input
  const firstFrame = await sharp(buffer)
  try {
    const { pages } = await firstFrame.metadata()
    const page = Math.round(pages / 2) || 0
    const middleFrame = await sharp(buffer, { page })
    input = await toSizedBuffer(middleFrame)
  } catch (e) {
    // so far we have only seen faulty gifs cause this to catch
    console.log(
      'Failed to slice middle GIF frame (or "page"), defaulting to first frame.',
      { id },
    )
    input = await toSizedBuffer(firstFrame)
  }

  return {
    input,
    raw: { width, height, channels: 4 },
    top,
    left,
  }
}

const createGroupPhoto = async (urls) => {
  const padding = 16
  const brandingHeight = 80
  const conferenceOutputPath = './temp/conference_logo.png'

  const imgs = await fetchImgs(urls)

  const layout = createImageLayout(imgs)

  await sharp('./uploads/CascadiaJSLong.png')
    .resize(null, brandingHeight)
    .toFile(conferenceOutputPath)
  const imgLogo = await sharp(conferenceOutputPath)
  const logoMetadata = await imgLogo.metadata()

  const totalWidth = layout.width + padding * 2
  const totalHeight = layout.height + logoMetadata.height + padding * 3

  const imgRows = chunkArray(layout.imgs, layout.rowCellCount)

  // compositing the images row by row before the main composite to create the group photo
  // compositing all assets at once (> 300 or so) made sharp crash
  const greetingsComposites = await Promise.all(
    imgRows.map(async (row, i) => {
      const composites = await Promise.all(
        row.map((img) =>
          compositeGif(img.data.data, {
            top: 0,
            left: img.left,
            width: layout.imgWidth,
            height: layout.imgHeight,
            id: img.data.config.url,
          }),
        ),
      )
      const buffer = await sharp({
        create: {
          height: layout.imgHeight,
          width: layout.rowCellCount * layout.imgWidth,
          background: '#EDF2F7',
          channels: 3,
        },
      })
        .composite(composites)
        .toBuffer({ resolveWithObject: true })

      return {
        input: buffer.data,
        raw: buffer.info,
        top: i * layout.imgHeight + padding,
        left: padding,
      }
    }),
  )

  const background = await sharp({
    create: {
      height: totalHeight,
      width: totalWidth,
      channels: 3,
      background: 'white',
    },
  })

  const backdropComposite = {
    input: {
      create: {
        height: layout.height,
        width: layout.width,
        background: '#EDF2F7',
        channels: 3,
      },
    },
    top: padding,
    left: padding,
  }

  const logoComposite = {
    input: conferenceOutputPath,
    top: layout.height + padding * 2,
    left: Math.floor(totalWidth / 2 - logoMetadata.width / 2),
  }

  const groupPhoto = await background.composite([
    backdropComposite,
    ...greetingsComposites,
    logoComposite,
  ])

  return groupPhoto
}

const outputPath = './temp/group-photo.jpeg'

const createGroupPhotoStream = async (urls) => {
  try {
    const groupPhoto = await createGroupPhoto(urls)
    console.log('Group Photo Processed')
    const jpeg = await groupPhoto.jpeg({
      quality: 75,
    })
    await jpeg.toFile(outputPath)
    console.log(`Group Photo Output to ${outputPath}`)
    return fs.createReadStream(outputPath)
  } catch (e) {
    console.log(e)
    return null
  }
}

module.exports = { createGroupPhotoStream }
