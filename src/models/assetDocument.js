export default (sequelize, DataTypes) => {
  const AssetDocument = sequelize.define('assetDocument', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    assetId: {
      type: DataTypes.UUID,
    },
    assetRequestId: {
      type: DataTypes.UUID,
    },
    userId: {
      type: DataTypes.UUID,
    },
    fileUrl: {
      type: DataTypes.STRING
    },
    assetLabel: {
      type: DataTypes.ENUM,
      values: ['PRIMARY','DERIVATIVE']
    },
    deletedAt: {
      type: DataTypes.DATE,
    }
  }, { underscored: true, paranoid: true })
  AssetDocument.associate = (models) => {
    AssetDocument.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user'
    })
    AssetDocument.belongsTo(models.AssetRequest, {
      foreignKey: 'assetRequestId',
      targetKey: 'id',
      as: 'assetRequest'
    })
    AssetDocument.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      targetKey: 'id',
      as: 'asset'
    })
  }
  return AssetDocument

}