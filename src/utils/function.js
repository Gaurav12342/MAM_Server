import Jimp from 'jimp'

export const resizeImage = function (url, height, width) {
  return new Promise(async (resolve) => {
    Jimp.read(url, (err, img) => {
      if (err) throw err
      img
        .resize(height, width)
      return resolve(img)
    })
  }).then(async (resolve) => {
    const bufferImg = await resolve.getBufferAsync(Jimp.MIME_JPEG)
    return new Promise((resolve, reject) => {
      return resolve(bufferImg)
    })
  })
}

export const imageTypeConversion = function (url) {
  return new Promise(async (resolve) => {
    Jimp.read(url, (err, img) => {
      if (err) throw err
      img
      return resolve(img)
    })
  }).then(async (resolve) => {
    const bufferImg = await resolve.getBufferAsync(Jimp.MIME_JPEG)
    return new Promise((resolve, reject) => {
      return resolve(bufferImg)
    })
  })
}
