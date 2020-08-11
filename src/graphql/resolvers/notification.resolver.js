export default {
  Query: {
    getNotification: async (parent, args, ctx) => {
      const { models } = ctx
      const notifications = await models.Notification.findOne({
        where: { receiverId: ctx.req.user.id },
        order: [
          ['createdAt', 'DESC'],
          ['updatedAt', 'DESC']
        ]
      })
      return notifications
    },
    getNotifications: async (parent, args, ctx) => {
      const { models } = ctx
      const notifications = await models.Notification.findAll({
        where: { receiverId: ctx.req.user.id },
        order: [
          ['createdAt', 'DESC'],
          ['updatedAt', 'DESC']
        ]
      })
      return notifications
    },
    countNotifications: async (parent, args, ctx) => {
      const { models } = ctx
      return models.Notification.count({ where: { receiverId: ctx.req.user.id } })
    }
  },
  Mutation: {
    createNotification: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args
      return models.Notification.create(data)
    },
    updateNotification: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      await models.Notification.update({ isViewed: true }, { where: { id: where.id } })
      return models.Notification.findOne({ where: { id: where.id } })
    }
  }
}