import mongoose, { type Document, type Model } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: "donor" | "volunteer" | "admin" | "reviewer" | "ngo_partner"
  credits: number
  profile: {
    phone?: string
    address?: string
    preferences?: string[]
    organization?: string
    verificationLevel?: "basic" | "verified" | "trusted"
    specializations?: string[]
    pushNotifications?: boolean
    showInLeaderboard?: boolean
    avatar?: string
    bio?: string
    socialLinks?: {
      website?: string
      linkedin?: string
      twitter?: string
    }
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
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["donor", "volunteer", "admin", "reviewer", "ngo_partner"],
      default: "donor",
    },
    credits: { type: Number, default: 0 },
    profile: {
      phone: String,
      address: String,
      preferences: [String],
      organization: String,
      verificationLevel: {
        type: String,
        enum: ["basic", "verified", "trusted"],
        default: "basic",
      },
      specializations: [String],
      pushNotifications: { type: Boolean, default: true },
      showInLeaderboard: { type: Boolean, default: true },
      avatar: String,
      bio: String,
      socialLinks: {
        website: String,
        linkedin: String,
        twitter: String,
      },
    },
    permissions: {
      type: [String],
      default: function () {
        switch (this.role) {
          case "admin":
            return ["read:all", "write:all", "delete:all", "manage:users"]
          case "reviewer":
            return ["read:donations", "write:donations", "verify:medicines"]
          case "ngo_partner":
            return ["read:donations", "request:medicines", "read:analytics"]
          case "volunteer":
            return ["read:donations", "update:volunteer_tasks"]
          default:
            return ["read:own", "write:own"]
        }
      },
    },
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
  {
    timestamps: true,
  },
)

// Indexes for performance
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ "profile.verificationLevel": 1 })

// Account lockout logic
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

UserSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates: any = { $inc: { loginAttempts: 1 } }

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }

  return this.updateOne(updates)
}

// Permission checking methods
UserSchema.methods.hasPermission = function (permission: string): boolean {
  return this.permissions.includes(permission) || this.permissions.includes("write:all")
}

UserSchema.methods.canAccess = function (resource: string, action: string): boolean {
  const permission = `${action}:${resource}`
  return this.hasPermission(permission)
}

// Achievement methods
UserSchema.methods.addAchievement = function (achievement: any) {
  if (!this.achievements.find((a: any) => a.id === achievement.id)) {
    this.achievements.push({
      ...achievement,
      unlockedAt: new Date(),
    })
    this.credits += achievement.points || 0
    return this.save()
  }
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
