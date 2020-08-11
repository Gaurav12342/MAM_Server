import { uploadToS3, deleteFile } from '../../utils/s3'
import sendEmail from '../../utils/sendEmail'
import Sequelize from 'sequelize'
import moment from 'moment'
import { pubsub, pubsubTopics } from '../../utils/subscription'
const { Op } = Sequelize

export default {
  Query: {
    getAssetRequest: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      const assetRequest = await models.AssetRequest.findOne({
        where: { id: where.id },
        include: [{
          model: models.Asset,
          as: 'assets'
        }, {
          model: models.User,
          as: 'user'
        }],
        order: [
          ['createdAt', 'DESC'],
          ['updatedAt', 'DESC']
        ]
      })
      const userShareWith = await models.User.findAll({
        where: { id: { [Op.in]: assetRequest.shareWith } }
      })
      assetRequest.shareWith = userShareWith
      return assetRequest
    },

    getAssetRequests: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      const assetRequests = await models.AssetRequest.findAll({
        where: where,
        include: [{
          model: models.Asset,
          as: 'assets'
        }, {
          model: models.User,
          as: 'user',
        }],
        order: [
          ['createdAt', 'DESC'],
          ['updatedAt', 'DESC']
        ]
      })

      for (let assetRequest of assetRequests) {
        if (assetRequest.shareWith) {
          const userShareWith = await models.User.findAll({
            where: { id: { [Op.in]: assetRequest.shareWith } }
          })
          assetRequest.shareWith = userShareWith
        }
      }
      return assetRequests
    }
  },
  Mutation: {
    createAssetRequest: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args

      const assetRequestUrls = []
      if (data && data.fileUrls) {
        for await (let file of data.fileUrls) {
          const { createReadStream, filename } = await file
          const stream = await createReadStream()
          const url = await uploadToS3(stream, filename)
          assetRequestUrls.push(url)
        }
        data.fileUrls = assetRequestUrls
      }

      if (data && data.shareWith) {
        let userArray = []
        for (let email of data.shareWith) {
          const userCheck = await models.User.findOne({ where: { email: email } })
          if (userCheck == null) {
            let randomPassword = Math.random().toString(36).slice(-8)
            let generateToken = Math.random().toString(35).slice(-7)
            let expiryToken = new Date()
            expiryToken.setHours(expiryToken.getHours() + 3)

            const createUser = await models.User.create({ email: email, password: randomPassword, token: generateToken, tokenExpiration: expiryToken })
            userArray.push(createUser.id)
            data.shareWith = userArray

            await sendEmail({
              toEmailAddresses: [createUser.email],
              templateKey: "notification_email",
              data: {
                content: `Hi ${createUser.email},
            You have been invited to join the MAM system,
            Registration link: http://localhost:3000/registration/${generateToken}`
              }
            })
          } else {
            userArray.push(userCheck.id)
            data.shareWith = userArray
            await sendEmail({
              toEmailAddresses: [email],
              templateKey: "notification_email",
              data: {
                content: "hello"
              }
            })
          }
        }
      }
      data.userId = ctx.req.user.id
      const assetRequestCreated = await models.AssetRequest.create(data)
      let assetsArray = []
      if (data && data.assets && data.assets.length > 0) {
        for (let assetObj of data.assets) {
          assetObj.userId = ctx.req.user.id
          let assetUrls = []
          for await (let file of assetObj.fileUrls) {
            const { createReadStream, filename } = await file
            const stream = await createReadStream()
            const url = await uploadToS3(stream, filename)
            assetUrls.push(url)
          }
          assetObj.fileUrls = assetUrls
          assetsArray.push({ ...assetObj, assetRequestId: assetRequestCreated.id })
        }
      }

      const createdAssets = await models.Asset.bulkCreate(assetsArray)
      if (createdAssets.length === 0) {
        throw new Error('Error while creating assets')
      }
      const assetRequest = await models.AssetRequest.findOne({
        where: { id: assetRequestCreated.id },
        include: [{
          model: models.Asset,
          as: 'assets'
        }, {
          model: models.User,
          as: 'user'
        }]
      })
      let referenceDataObj = { title: assetRequest.title, description: assetRequest.description }
      if (data.shareWith) {
        const userShareWith = await models.User.findAll({
          where: { id: { [Op.in]: data.shareWith } }
        })
        assetRequest.shareWith = userShareWith
        for (let shareWith of userShareWith) {
          await models.Notification.create({ title: 'CREATE ASSET REQUEST', content: 'Asset Request Successfully Created', senderId: ctx.req.user.id, receiverId: shareWith.id, referenceId: assetRequest.id, referenceData: referenceDataObj })
        }
      }
      pubsub.publish(pubsubTopics.CREATE_ASSET_REQUEST, { notification: assetRequest })
      return assetRequest

    },
    updateAssetRequest: async (parent, args, ctx) => {
      const { models } = ctx
      const { data, where } = args

      const assetRequestUrls = []
      if (data && data.fileUrls) {
        for (let file of data.fileUrls) {
          const { createReadStream, filename } = await file
          const stream = await createReadStream()
          const url = await uploadToS3(stream, filename)
          assetRequestUrls.push(url)
        }
        data.fileUrls = assetRequestUrls
      }

      if (data && data.shareWith) {
        let userArray = []
        for (let email of data.shareWith) {
          const userCheck = await models.User.findOne({ where: { email: email } })
          if (userCheck == null) {
            let randomPassword = Math.random().toString(36).slice(-8)
            let generateToken = Math.random().toString(35).slice(-7)
            let expiryToken = new Date()
            expiryToken.setHours(expiryToken.getHours() + 3)

            const createUser = await models.User.create({ email: email, password: randomPassword, token: generateToken, tokenExpiration: expiryToken })
            userArray.push(createUser.id)
            data.shareWith = userArray

            await sendEmail({
              toEmailAddresses: [createUser.email],
              templateKey: "notification_email",
              data: {
                content: `Hi ${createUser.email},
            You have been invited to join the MAM system,
            Registration link: http://localhost:3000/registration/${generateToken}`
              }
            })
          } else {
            userArray.push(userCheck.id)
            data.shareWith = userArray
            await sendEmail({
              toEmailAddresses: [email],
              templateKey: "notification_email",
              data: {
                content: "hello"
              }
            })
          }
        }
      }
      await models.AssetRequest.update(data, { where: { id: where.id } })
      const updatedAssetRequest = await models.AssetRequest.findOne({
        where: { id: where.id },
        include: [{
          model: models.Asset,
          as: 'assets'
        }, {
          model: models.User,
          as: 'user'
        },
        ]
      })
      let referenceDataObj = { title: updatedAssetRequest.title, description: updatedAssetRequest.description }

      if (updatedAssetRequest && updatedAssetRequest.shareWith) {
        const userShareWith = await models.User.findAll({
          where: { id: { [Op.in]: updatedAssetRequest.shareWith } }
        })

        updatedAssetRequest.shareWith = userShareWith

        for (let shareWith of userShareWith) {
          await models.Notification.create({ title: 'UPDATE ASSET REQUEST', content: 'Asset Request Successfully updated', senderId: ctx.req.user.id, receiverId: shareWith.id, referenceId: updatedAssetRequest.id, referenceData: referenceDataObj })
        }
      }
      pubsub.publish(pubsubTopics.UPDATE_ASSET_REQUEST, { notification: updatedAssetRequest })
      return updatedAssetRequest

    },
    deleteAssetRequest: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      const assetRequest = await models.AssetRequest.findOne({ where: { id: where.id } })
      const assetDocument = await models.AssetDocument.findOne({ where: { assetRequestId: where.id } })
      if (assetRequest && assetRequest.fileUrls) {
        for (let url of assetRequest.fileUrls) {
          const imageNames = url.split('/')
          deleteFile(`${imageNames[imageNames.length - 1]}`)
        }
      }
      if (assetDocument && assetDocument.fileUrl) {
        const imageNames = assetDocument.fileUrl.split('/')
        deleteFile(`${imageNames[imageNames.length - 1]}`)
      }
      const deletedAssetRequest = await models.AssetRequest.destroy({ where: { id: where.id } })
      if (deletedAssetRequest == 1) {
        return true
      }

    }
  },
  Subscription: {
    notification: {
      subscribe: (parent, args, ctx) => {
        return pubsub.asyncIterator([pubsubTopics.CREATE_ASSET_REQUEST, pubsubTopics.UPDATE_ASSET_REQUEST])
      }
    },
  }

}