import { uploadToS3 } from '../../utils/s3'
import { imageTypeConversion, resizeImage } from '../../utils/function'
import { pubsub, pubsubTopics } from '../../utils/subscription'


export default {
  Query: {
    getAssetDocument: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.AssetDocument.findOne({
        where: { id: where.id },
        include: [{
          model: models.Asset,
          as: 'asset'
        }, {
          model: models.User,
          as: 'user'
        },
        {
          model: models.AssetRequest,
          as: 'assetRequest'
        },
        ]
      })
    },

    getAssetDocuments: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.AssetDocument.findAll({
        where: where,
        include: [{
          model: models.Asset,
          as: 'asset'
        }, {
          model: models.User,
          as: 'user'
        },
        {
          model: models.AssetRequest,
          as: 'assetRequest'
        },
        ]
      })
    }
  },
  Mutation: {
    createAssetDocument: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args
      if (data && data.fileUrl) {
        const Asset = await models.Asset.findOne({ where: { id: data.assetId } })
        const { createReadStream, filename } = await data.fileUrl
        const stream = await createReadStream()
        let chunk = []
        stream.on('data', data => chunk.push(data))
          .on('end', () => {
            const buffer = Buffer.concat(chunk)
            let conLength = buffer.length
            let convertFileLength = conLength / 1000000
            if (convertFileLength > Asset.maxFileSize) {
              throw new Error('file is too big')
            }
          })
        const url = await uploadToS3(stream, filename)
        data.fileUrl = url
        data.assetLabel = 'PRIMARY'
        const assetDocumentCreated = await models.AssetDocument.create(data)
        const AssetDocumentCreate = await models.AssetDocument.findOne({
          where: { id: assetDocumentCreated.id },
          include: [{
            model: models.Asset,
            as: 'asset'
          }, {
            model: models.User,
            as: 'user'
          },
          {
            model: models.AssetRequest,
            as: 'assetRequest'
          },
          ]
        })
        await models.Asset.update({ status: 'WAITING' }, { where: { id: AssetDocumentCreate.asset.id } })
        const asset = await models.Asset.findOne({ where: { id: AssetDocumentCreate.asset.id } })
        if (assetDocumentCreated && assetDocumentCreated.fileUrl) {
          const fileUrl = await assetDocumentCreated.fileUrl
          for (let derivativeDetails of asset.derivativeDetails) {
            const height = derivativeDetails.height
            const width = derivativeDetails.width
            const image = await resizeImage(fileUrl, height, width)
            const split = filename.split('.')
            split.splice(1, 10, derivativeDetails.extensions)
            const fileName = split.join('.')
            const url = await uploadToS3(image, fileName)
            await models.AssetDocument.create({ assetId: assetDocumentCreated.assetId, assetRequestId: assetDocumentCreated.assetRequestId, userId: assetDocumentCreated.userId, fileUrl: url, assetLabel: 'DERIVATIVE' })
          }
        }
        await models.Notification.create({ title: 'CREATE ASSET DOCUMENT', content: 'Asset Document Successfully created', senderId: ctx.req.user.id, receiverId: asset.userId, referenceId: assetDocumentCreated.id })
        pubsub.publish(pubsubTopics.CREATE_ASSET_DOCUMENT, { assetDocumentNotification: AssetDocumentCreate })
        return AssetDocumentCreate
      }

    },

    updateAssetDocument: async (parent, args, ctx) => {
      const { models } = ctx
      const { data, where } = args
      if (data && data.fileUrl) {
        const { createReadStream, filename } = await data.fileUrl
        const stream = await createReadStream()
        const url = await uploadToS3(stream, filename)
        data.fileUrl = url
      }
      await models.AssetDocument.update(data, { where: { id: where.id } })
      const updateAssetDocument = await models.AssetDocument.findOne({
        where: { id: args.where.id },
        include: [{
          model: models.Asset,
          as: 'asset'
        }, {
          model: models.User,
          as: 'user'
        },
        {
          model: models.AssetRequest,
          as: 'assetRequest'
        },
        ]
      })
      let referenceDataObj = { fileUrl: updateAssetDocument.fileUrl }
      await models.Notification.create({ title: 'UPDATE ASSET DOCUMENT', content: 'Asset Document Successfully updated', senderId: ctx.req.user.id, receiverId: updateAssetDocument.asset.userId, referenceId: updateAssetDocument.id, referenceData: referenceDataObj })
      pubsub.publish(pubsubTopics.UPDATE_ASSET_DOCUMENT, { assetDocumentNotification: updateAssetDocument })
      return updateAssetDocument
    },

    deleteAssetDocument: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      const assetDocument = await models.AssetDocument.findOne({ where: { id: where.id } })
      if (assetDocument) {
        const deletedAssetDocument = await models.AssetDocument.destroy({ where: { id: assetDocument.id } })
        if (deletedAssetDocument == 1) {
          return true
        }
      }
    }
  },
  Subscription: {
    assetDocumentNotification: {
      subscribe: (parent, args, ctx) => {
        return pubsub.asyncIterator([pubsubTopics.CREATE_ASSET_DOCUMENT, pubsubTopics.UPDATE_ASSET_DOCUMENT])
      }
    }
  }
}