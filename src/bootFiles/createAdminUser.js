
import models from '../models'

const userData =
{
  name: 'Admin',
  role: 'ADMIN',
  email: 'raj@logicwind.com',
  contact: '9979967400',
  username: 'admin',
  password: 'admin123'
}
const createUserData = async (app) => {
  try {
    const user = await models.User.findAll()
    if (user.length === 0) {
      await models.User.create(userData)
    }
  }
  catch (err) {
    throw err
  }
}
createUserData()
