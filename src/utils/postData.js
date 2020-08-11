import axios from 'axios'
import { merge } from 'lodash'

module.exports = async (url, data) => {
  const appData = {
    applicationId: process.env.MAIL_MONKEY_APPLICATION_ID,
    secretKey: process.env.MAIL_MONKEY_SECRET_KEY,
  }
  axios(url, {
    data: JSON.stringify(merge(appData, data)), // must match 'Content-Type' header
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
  }).then(res => {
    console.log('STATUS CODE > ', res.status)
  }).catch(error => {
    console.error(error)
  })
}