const createAdminUser = require('./createAdminUser')
const BootFiles = (app) => {
  createAdminUser(app)
}

export default BootFiles