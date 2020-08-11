import postData from './postData'
/**
 *
 * @param {data} object should contain below fields
 *  {fromEmailAddress}
 *  {fromEmailName}
 *  {toEmailAddresses}
 *  {templateKey} or
 *  {templateId}
 *  {data} as in JSON object of variable data
 *
 */
const sendEmail = async (data = {}) => {
  try {
    const reqData = {
      fromEmailName: data.fromName || process.env.MAIL_MONKEY_FROM_NAME,
      fromEmailAddress: data.fromEmail || process.env.MAIL_MONKEY_FROM_EMAIL,
      toEmailAddresses: data.toEmailAddresses,
      templateKey: data.templateKey,
      data: [data.data]
    }
    const response = await postData(`${process.env.MAIL_MONKEY_HOST}/email/send`, reqData)
    return response
  } catch (e) {
    return e
  }
}
//for testing uncomment the below line
// sendEmail()
export default sendEmail