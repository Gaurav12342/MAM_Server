import Sequelize from 'sequelize'

const sequelize = new Sequelize('mam', 'postgres', 'root', {
  host: 'localhost',
  dialect: 'postgres',
  underscored: true,
})
sequelize.options.logging = false

const models = {
  User: sequelize.import('./user'),
  AssetRequest: sequelize.import('./assetRequest'),
  Asset: sequelize.import('./asset'),
  AssetDocument: sequelize.import('./assetDocument'),
  AssetTemplate: sequelize.import('./assetTemplate'),
  Notification: sequelize.import('./notification')
}
try {
  sequelize.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.error('Unable to connect to the database:', error)
}
Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models)
  }
})

models.sequelize = sequelize
models.Sequelize = Sequelize

export default models