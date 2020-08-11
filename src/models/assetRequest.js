export default (sequelize, DataTypes) => {
  const AssetRequest = sequelize.define('assetRequest', {
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
    deliveryDate: {
      type: DataTypes.DATEONLY,
    },
    brandColor: {
      type: DataTypes.JSONB,
    },
    shareWith: {
      type: DataTypes.ARRAY(DataTypes.UUID),
    },
    userId: {
      type: DataTypes.UUID
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, { underscored: true, paranoid: true })

  AssetRequest.associate = (models) => {
    AssetRequest.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user'
    })

    AssetRequest.hasMany(models.Asset, {
      foreignKey: 'assetRequestId',
      sourceKey: 'id',
      as: 'assets'
    })
    AssetRequest.hasMany(models.AssetTemplate, {
      foreignKey: 'assetRequestId',
      sourceKey: 'id',
      as: 'assetRequest'
    })
  }
  return AssetRequest
}