import logger from './logger'
import server from './server'
import models from './models'
models.sequelize.sync({}).then(() => {
  server.listen(process.env.PORT, async () => {
    require('../src/bootFiles/index')
    logger.info(`server started on port ${process.env.PORT}`)
  })
})
