export default (sequelize, DataTypes) => {
  const Notification = sequelize.define('notification', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.STRING
    },
    senderId: {
      type: DataTypes.STRING
    },
    receiverId: {
      type: DataTypes.STRING
    },
    referenceId: {
      type: DataTypes.STRING
    },
    referenceData: {
      type: DataTypes.JSONB
    },
    route: {
      type: DataTypes.STRING
    },
    isViewed: {
      type: DataTypes.BOOLEAN
    },
  }, { underscored: true })

  return Notification
}