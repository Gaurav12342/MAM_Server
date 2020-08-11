import bcrypt from 'bcryptjs'
export default (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: "email must be unique"
      },
      validate: {
        isEmail: {
          msg: "email must be in proper format"
        },
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM,
      values: ['ADMIN', 'USER'],
      defaultValue: 'USER'
    },
    profileImage: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING,
    },
    tokenExpiration: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    }


  }, { underscored: true, paranoid: true })
  User.associate = (models) => {
    User.hasMany(models.AssetRequest, {
      foreignKey: 'userId',
      targetKey: 'id'
    })
  }

  User.findByLogin = async (email) => {
    let user = await User.findOne({
      where: { email: email }
    })

    if (!user) {
      user = await User.findOne({
        where: { email: email },
      })
    }
    return user
  }
  User.beforeCreate(async (user) => {
    user.password = await user.generatePasswordHash()
  })
  User.prototype.generatePasswordHash = async function () {
    const saltRounds = 10
    return await bcrypt.hash(this.password, saltRounds)
  }

  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
  }
  return User
}