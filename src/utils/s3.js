import AWS from 'aws-sdk'
export const uploadToS3 = async (stream, filename) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_S3_REGION
  })
  let params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Body: stream,
    Key: filename,
    ACL: 'public-read'
  }
  const s3Upload = () => {
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          return reject(err)

        } //handle error
        //Note: check the response of S3
        if (data) { //success
          return resolve(data.Location)
        }
      })
    })
  }
  const response = await s3Upload()
  return response
}
export const deleteFile = async (filename) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_S3_REGION
  })
  let params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
  }
  s3.deleteObject(params, function (err, data) {
    if (data) {
      console.log("File deleted successfully", filename)
    }
    else {
      console.log("Check if you have sufficient permissions : " + err)
    }
  })
}
