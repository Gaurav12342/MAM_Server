import { rule, shield, not, or, deny, allow, and } from 'graphql-shield'

const isAdmin = rule()(async (parent, args, ctx, info) => {
  return ctx.req.user.role === 'ADMIN'
})
const isUser = rule()(async (parent, args, ctx, info) => {
  return ctx.req.user.role === 'USER'
})


const permissions = shield({
  Query: {
    '*': allow,
    'currentUser': or(isUser, isAdmin),
    'getUsers': or(isUser, isAdmin),
    'getUser': or(isUser, isAdmin),
    'getAssetRequests': or(isUser, isAdmin),
    'getAssetRequest': or(isUser, isAdmin),
    'getAssets': or(isUser, isAdmin),
    'getAsset': or(isUser, isAdmin),
    'getAssetDocuments': or(isUser, isAdmin),
    'getAssetDocument': or(isUser, isAdmin),
    'getAssetTemplates': or(isUser, isAdmin),
    'getAssetTemplate': or(isUser, isAdmin),
    'getNotification': or(isUser, isAdmin),
    'getNotifications': or(isUser, isAdmin)
  },
  Mutation: {
    '*': allow,
    'login': allow,
    'createUser': allow,
    'handleValidateInviteToken': allow,
    'forgotPassword': allow,
    'handleValidateResetPasswordToken': allow,
    'changePassword': or(isUser, isAdmin),
    'updateUser': or(isUser, isAdmin),
    'createAssetRequest': or(isUser, isAdmin),
    'updateAssetRequest': or(isUser, isAdmin),
    'deleteAssetRequest': or(isUser, isAdmin),
    'createAsset': or(isUser, isAdmin),
    'updateAsset': or(isUser, isAdmin),
    'deleteAsset': or(isUser, isAdmin),
    'createAssetDocument': or(isUser, isAdmin),
    'updateAssetDocument': or(isUser, isAdmin),
    'deleteAssetDocument': or(isUser, isAdmin),
    'createAssetTemplate': or(isUser, isAdmin),
    'updateAssetTemplate': or(isUser, isAdmin),
    'deleteAssetTemplate': or(isUser, isAdmin)

  }
}, {
  debug: true,
})

export default permissions
