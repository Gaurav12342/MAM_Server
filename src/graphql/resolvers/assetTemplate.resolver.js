export default {
  Query: {
    getAssetTemplate: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.AssetTemplate.findOne({
        where: { id: where.id },
        include: [{
          model: models.User,
          as: 'user'
        }]
      })
    },
    getAssetTemplates: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.AssetTemplate.findAll({
        where: where,
        include: [{
          model: models.User,
          as: 'user'
        }]
      })
    }
  },
  Mutation: {
    createAssetTemplate: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args
      const templateCreated = await models.AssetTemplate.create(data)
      const assetTemplateCreate = await models.AssetTemplate.findOne({
        include: [{
          model: models.User,
          as: 'user'
        }],
        where: { id: templateCreated.id }
      })
      return assetTemplateCreate
    },
    updateAssetTemplate: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args
      return models.AssetTemplate.update(data)
    },
    deleteAssetTemplate: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      const assetTemplate = await models.AssetTemplate.findOne({ where: { id: where.id } })
      if (assetTemplate) {
        const deletedAssetTemplate = await models.AssetTemplate.destroy({ where: { id: assetTemplate.id } })
        if (deletedAssetTemplate == 1) {
          return true
        }
      }
    }
  }
}