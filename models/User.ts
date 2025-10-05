import mongoose, { Document, Model, Schema } from "mongoose"

// 🧠 User Interface
export interface IUser extends Document {
  name: string
  email: string
  password?: string
  image?: string
  role: "donor" | "volunteer" | "admin" | "reviewer" | "ngo_partner" | "user"
  isActive: boolean
  credits: number
  profile?: {
    phone?: string
    address?: string
    verificationLevel?: "basic" | "verified" | "trusted"
  }
  permissions: string[]
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: Date
    category: string
    points: number
  }>
  twoFactor: {
    enabled: boolean
    secret?: string
    backupCodes?: string[]
    lastUsedCode?: string
  }
  loginAttempts: number
  lockUntil?: Date
  lastLogin?: Date
  emailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  createdAt: Date
  updatedAt: Date

  // Methods
  incLoginAttempts: () => Promise<any>
  hasPermission: (permission: string) => boolean
  canAccess: (resource: string, action: string) => boolean
  addAchievement: (achievement: any) => Promise<IUser | void>
  isLocked: boolean
}

// 🧩 Schema Definition
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ["donor", "volunteer", "admin", "reviewer", "ngo_partner", "user"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    credits: { type: Number, default: 0 },

    profile: {
      phone: String,
      address: String,
      verificationLevel: {
        type: String,
        enum: ["basic", "verified", "trusted"],
        default: "basic",
      },
    },

    permissions: { type: [String], default: [] },

    achievements: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        unlockedAt: Date,
        category: String,
        points: { type: Number, default: 0 },
      },
    ],

    twoFactor: {
      enabled: { type: Boolean, default: false },
      secret: String,
      backupCodes: [String],
      lastUsedCode: String,
    },

    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastLogin: Date,

    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
)

// ⚡ Indexing for faster role-based queries
UserSchema.index({ role: 1 })

// 🔒 Virtuals
UserSchema.virtual("isLocked").get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date())
})

// 🚨 Login Attempts Method
UserSchema.methods.incLoginAttempts = async function (this: IUser) {
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({ $unset: { lockUntil: 1 }, $set: { loginAttempts: 1 } })
  }

  const updates: Record<string, any> = { $inc: { loginAttempts: 1 } }
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) } // 2 hours
  }

  return this.updateOne(updates)
}

// 🧩 Permission Checks
UserSchema.methods.hasPermission = function (this: IUser, permission: string): boolean {
  return this.permissions.includes(permission) || this.permissions.includes("write:all")
}

UserSchema.methods.canAccess = function (this: IUser, resource: string, action: string): boolean {
  return this.hasPermission(`${action}:${resource}`)
}

// 🏅 Achievement System
UserSchema.methods.addAchievement = async function (this: IUser, achievement: any) {
  if (!this.achievements.find((a) => a.id === achievement.id)) {
    this.achievements.push({ ...achievement, unlockedAt: new Date() })
    this.credits += achievement.points || 0
    await this.save()
    return this
  }
}

// ⚙️ Auto-set permissions based on role if not set
UserSchema.pre<IUser>("save", function (next) {
  if (!this.permissions || this.permissions.length === 0) {
    switch (this.role) {
      case "admin":
        this.permissions = ["read:all", "write:all", "delete:all", "manage:users"]
        break
      case "reviewer":
        this.permissions = ["read:donations", "write:donations", "verify:medicines"]
        break
      case "ngo_partner":
        this.permissions = ["read:donations", "request:medicines", "read:analytics"]
        break
      case "volunteer":
        this.permissions = ["read:donations", "update:volunteer_tasks"]
        break
      default:
        this.permissions = ["read:own", "write:own"]
    }
  }
  next()
})

// 🧾 Final Export
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
