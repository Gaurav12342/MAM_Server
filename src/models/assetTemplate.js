export default (sequelize, DataTypes) => {
  const AssetTemplate = sequelize.define('assetTemplate', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    extensions: {
      type: DataTypes.ENUM,
      values: ['png', 'jpg', 'jpeg', 'pdf']
    },
    maxFileSize: {
      type: DataTypes.FLOAT,
    },
    height: {
      type: DataTypes.FLOAT,
    },
    width: {
      type: DataTypes.FLOAT,
    },
    transparentBg: {
      type: DataTypes.BOOLEAN,
    },
    derivativeDetails: {
      type: DataTypes.JSONB,
    },
    userId: {
      type: DataTypes.UUID,
    },

  }, { underscored: true, paranoid: true })
  AssetTemplate.associate = (models) => {
    AssetTemplate.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user'
    })
    AssetTemplate.belongsTo(models.AssetRequest, {
      foreignKey: 'assetRequestId',
      targetKey: 'id',
      as: 'assetRequest'
    })
    AssetTemplate.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      targetKey: 'id',
      as: 'asset'
    })
  }
  return AssetTemplate

}