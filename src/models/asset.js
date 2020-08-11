export default (sequelize, DataTypes) => {
  const Asset = sequelize.define('asset', {
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
    fileUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
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
      type: DataTypes.UUID
    },
    status: {
      type: DataTypes.ENUM,
      values: ['PENDING', 'WAITING', 'APPROVE', 'REJECT'],
      defaultValue: 'PENDING'
    },
    assetRequestId: {
      type: DataTypes.UUID
    }
  }, { underscored: true, paranoid: true })

  Asset.associate = (models) => {
    Asset.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id'
    })
    Asset.belongsTo(models.AssetRequest, {
      foreignKey: 'assetRequestId',
      targetKey: 'id'
    })

  }
  return Asset
}