import jwt from 'jsonwebtoken'
import { AuthenticationError, UserInputError } from 'apollo-server'
import sendEmail from '../../utils/sendEmail'
import bcrypt from 'bcryptjs'
import { uploadToS3, deleteFile } from '../../utils/s3'


const createToken = async (user, secret, expiresIn) => {
  const { id, email } = user
  return jwt.sign({ id, email }, secret, { expiresIn })
}
export default {
  Query: {
    getUser: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.User.findOne({ where: { id: where.id } })
    },
    getUsers: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.User.findAll({ where: where })
    },
    currentUser: async (parent, args, ctx) => {
      const { models } = ctx
      const user = await models.User.findOne({ where: { id: ctx.req.user.id } })
      return user
    },
  },
  Mutation: {
    createUser: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args

      if (data && !data.email) {
        throw new Error('please enter email id')
      }
      else if (data && !data.name) {
        throw new Error('please enter name')
      }

      let randomPassword = Math.random().toString(36).slice(-8)
      let generateToken = Math.random().toString(35).slice(-7)
      let expiryToken = new Date()
      expiryToken.setHours(expiryToken.getHours() + 1)
      const createUser = await models.User.create({ email: data.email, name: data.name, password: randomPassword, token: generateToken, tokenExpiration: expiryToken })
      await sendEmail({
        toEmailAddresses: [createUser.email],
        templateKey: "notification_email",
        data: {
          content: `Registration link: http://localhost:3000/registration/${generateToken}`
        }
      })
      return createUser
    },

    handleValidateInviteToken: async (parent, args, ctx) => {
      const { models } = ctx
      const user = await models.User.findOne({ where: { token: args.token } })
      let currentDate = new Date()
      if (!user) {
        throw new Error("token is invalid")
      }
      if (user.expiryToken < currentDate) {
        throw new Error("Token Expired!!!!")
      }
      if (args && !args.password) {
        throw new Error("please enter password")
      }
      if (args.password.length < 6) {
        throw new Error("please enter at least 6 character")
      }
      let newPassword = await bcrypt.hash(args.password, 10)
      await models.User.update({ password: newPassword }, { where: { id: user.id } })
      return true
    },

    login: async (parent, args, ctx) => {
      const { models, secret } = ctx
      const { data } = args
      const user = await models.User.findByLogin(data.email)

      if (!user) {
        throw new UserInputError('no user found with this login credentials')
      }
      const isValid = await user.validatePassword(data.password)
      if (!isValid) {
        throw new AuthenticationError('Invalid password.')
      }
      const token = createToken(user, secret, '1440m')
      ctx.req.headers['authorization'] = token
      return { token }

    },
    forgotPassword: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args
      const user = await models.User.findOne({ where: { email: data.email } })

      if (!user) {
        throw new Error('user does not exists')
      }

      let generateToken = Math.random().toString(35).slice(-7)
      let expiryToken = new Date()
      expiryToken.setHours(expiryToken.getHours() + 1)
      await models.User.update({ token: generateToken, tokenExpiration: expiryToken }, { where: { id: user.id } })
      await sendEmail({
        toEmailAddresses: [data.email],
        templateKey: "notification_email",
        data: {
          content: `Forgot Password link: http://localhost:3000/forgotPassword/${generateToken}`
        }
      })
      return true
    },

    handleValidateResetPasswordToken: async (parent, args, ctx) => {
      const { models } = ctx
      const user = await models.User.findOne({ where: { token: args.token } })
      let currentDate = new Date()

      if (!user) {
        throw new Error('token is invalid!!!!')
      }
      if (user.expiryToken < currentDate) {
        throw new Error('token is expired!!!!')
      }
      if (args.newPassword.length < 6) {
        throw new Error('please enter at least 6 character')
      }
      let newPassword = await bcrypt.hash(args.newPassword, 10)
      await models.User.update({ password: newPassword }, { where: { id: user.id } })
      await sendEmail({
        toEmailAddresses: [user.email],
        templateKey: "notification_email",
        data: {
          content: `Password reset successfully`
        }
      })
      return true
    },

    changePassword: async (parent, args, ctx) => {
      const { models } = ctx
      const { data } = args
      const user = await models.User.findOne({ where: { id: ctx.req.user.id } })

      if (data.newPassword.length < 6) {
        throw new Error('please enter at least 6 character ')
      }
      if (data.currentPassword == data.newPassword) {
        throw new Error('new password must be different')
      }
      let validatePassword = await bcrypt.compare(data.currentPassword, user.password)
      if (validatePassword) {
        let newPassword = await bcrypt.hash(data.newPassword, 10)
        await models.User.update({ password: newPassword }, { where: { id: ctx.req.user.id } })
      }
      else {
        throw new Error('current password dont match')
      }
      await sendEmail({
        toEmailAddresses: [user.email],
        templateKey: "notification_email",
        data: {
          content: `Password changed successfully`
        }
      })
      return true
    },

    updateUser: async (parent, args, ctx) => {
      const { models } = ctx
      const { data, where } = args
      const user = await models.User.findOne({ where: { id: where.id } })

      if (!user) {
        throw new Error('user not exists!!!')
      }

      if (data && data.profileImage) {
        const { createReadStream, filename } = await data.profileImage
        const stream = await createReadStream()
        const url = await uploadToS3(stream, filename)
        data.profileImage = url
        if (user.profileImage) {
          const imageNames = user.profileImage.split('/')
          await deleteFile(`${imageNames[imageNames.length - 1]}`)
        }
      }
      await models.User.update(data, { where: { id: args.where.id } })
      return models.User.findOne({ where: { id: args.where.id } })
    },

    deleteUser: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      const user = await models.User.findOne({ where: { id: where.id } })
      if (!user) {
        throw new Error('user not exists!!!')
      }
      const deletedUser = await models.User.destroy({ where: { id: user.id } })
      if (deletedUser == 1) {
        return true
      }
    }
  },
}