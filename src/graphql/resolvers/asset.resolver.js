import { uploadToS3 } from '../../utils/s3'


export default {
  Query: {
    getAsset: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.Asset.findOne({ where: { id: where.id } })
    },
    getAssets: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.Asset.findAll({ where: where })
    }
  },

  Mutation: {
    createAsset: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args
      return models.Asset.create(data)
    },

    updateAsset: async (parent, args, ctx) => {
      const { models } = ctx
      const { data, where } = args
      let assetUpdateUrl = asset.file || []
      if (data && data.fileUrls) {
        for (let file of data.fileUrls) {
          const { createReadStream, filename } = await file
          const stream = await createReadStream()
          const url = await uploadToS3(stream, filename)
          assetUpdateUrl.push(url)
        }
      }
      data.fileUrls = assetUpdateUrl
      await models.Asset.update(data, { where: { id: where.id } })
      return models.Asset.findOne({ where: { id: where.id } })
    },

    deleteAsset: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      const asset = await models.Asset.findOne({ where: { id: where.id } })
      const deletedAsset = await models.Asset.destroy({ where: { id: asset.id } })
      if (deletedAsset == 1) {
        return true
      }

    }
  }
}