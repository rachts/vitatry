import { createSchema } from "graphql-yoga"
import { GraphQLScalarType } from "graphql"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Donation from "@/models/Donation"

// Custom Date scalar
const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : null
  },
  parseValue(value) {
    return value ? new Date(value) : null
  },
})

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    scalar Date
    
    type User {
      id: ID!
      name: String!
      email: String!
      role: String!
      credits: Int!
      profile: UserProfile
      createdAt: Date!
      updatedAt: Date!
      donations: [Donation!]
    }
    
    type UserProfile {
      phone: String
      address: String
      preferences: [String!]
    }
    
    type Medicine {
      name: String!
      quantity: Int!
      expiryDate: Date!
      batchNumber: String
      manufacturer: String
    }
    
    type Donation {
      id: ID!
      userId: ID
      user: User
      firstName: String!
      lastName: String!
      email: String!
      phone: String
      address: String
      medicines: [Medicine!]!
      status: String!
      verificationNotes: String
      verifiedBy: ID
      verifiedAt: Date
      creditsEarned: Int!
      images: [String!]
      createdAt: Date!
      updatedAt: Date!
    }
    
    type Query {
      user(id: ID!): User
      users: [User!]!
      donation(id: ID!): Donation
      donations(status: String, limit: Int, offset: Int): [Donation!]!
      userDonations(userId: ID!): [Donation!]!
      stats: Stats!
    }
    
    type Stats {
      totalDonations: Int!
      totalUsers: Int!
      medicinesDistributed: Int!
      pendingVerifications: Int!
    }
    
    input MedicineInput {
      name: String!
      quantity: Int!
      expiryDate: Date!
      batchNumber: String
      manufacturer: String
    }
    
    input DonationInput {
      firstName: String!
      lastName: String!
      email: String!
      phone: String
      address: String
      medicines: [MedicineInput!]!
      images: [String!]
    }
    
    input UserInput {
      name: String!
      email: String!
      password: String
      role: String
      profile: UserProfileInput
    }
    
    input UserProfileInput {
      phone: String
      address: String
      preferences: [String!]
    }
    
    type Mutation {
      createDonation(input: DonationInput!): Donation!
      updateDonationStatus(id: ID!, status: String!, notes: String): Donation!
      createUser(input: UserInput!): User!
      updateUser(id: ID!, input: UserInput!): User!
    }
  `,
  resolvers: {
    Date: DateScalar,

    Query: {
      user: async (_, { id }) => {
        await dbConnect()
        return await User.findById(id)
      },
      users: async () => {
        await dbConnect()
        return await User.find()
      },
      donation: async (_, { id }) => {
        await dbConnect()
        return await Donation.findById(id)
      },
      donations: async (_, { status, limit = 10, offset = 0 }) => {
        await dbConnect()
        const query = status ? { status } : {}
        return await Donation.find(query).limit(limit).skip(offset).sort({ createdAt: -1 })
      },
      userDonations: async (_, { userId }) => {
        await dbConnect()
        return await Donation.find({ userId }).sort({ createdAt: -1 })
      },
      stats: async () => {
        await dbConnect()
        const [totalDonations, totalUsers, pendingVerifications] = await Promise.all([
          Donation.countDocuments(),
          User.countDocuments(),
          Donation.countDocuments({ status: "pending" }),
        ])

        // Calculate distributed medicines (those with status 'distributed')
        const distributedDonations = await Donation.find({ status: "distributed" })
        const medicinesDistributed = distributedDonations.reduce((total, donation) => {
          return total + (donation.medicines?.length || 0)
        }, 0)

        return {
          totalDonations,
          totalUsers,
          medicinesDistributed,
          pendingVerifications,
        }
      },
    },

    User: {
      id: (user) => user._id.toString(),
      donations: async (user) => {
        await dbConnect()
        return await Donation.find({ userId: user._id })
      },
    },

    Donation: {
      id: (donation) => donation._id.toString(),
      user: async (donation) => {
        if (!donation.userId) return null
        await dbConnect()
        return await User.findById(donation.userId)
      },
    },

    Mutation: {
      createDonation: async (_, { input }, context) => {
        await dbConnect()

        // If authenticated, add userId
        let userId = null
        if (context.user?.id) {
          userId = context.user.id
        }

        const donation = await Donation.create({
          ...input,
          userId,
          status: "pending",
          creditsEarned: 0,
        })

        return donation
      },

      updateDonationStatus: async (_, { id, status, notes }) => {
        await dbConnect()

        const donation = await Donation.findById(id)
        if (!donation) {
          throw new Error("Donation not found")
        }

        donation.status = status
        if (notes) {
          donation.verificationNotes = notes
        }

        if (status === "verified") {
          donation.verifiedAt = new Date()

          // Calculate credits based on medicine quantity
          const creditsEarned = donation.medicines.reduce((total, medicine) => {
            return total + medicine.quantity * 5 // 5 credits per medicine
          }, 0)

          donation.creditsEarned = creditsEarned

          // Update user credits if there's a userId
          if (donation.userId) {
            const user = await User.findById(donation.userId)
            if (user) {
              user.credits += creditsEarned
              await user.save()
            }
          }
        }

        await donation.save()
        return donation
      },

      createUser: async (_, { input }) => {
        await dbConnect()

        // Check if user already exists
        const existingUser = await User.findOne({ email: input.email })
        if (existingUser) {
          throw new Error("User with this email already exists")
        }

        // Create new user
        const user = await User.create({
          ...input,
          credits: 0,
        })

        return user
      },

      updateUser: async (_, { id, input }) => {
        await dbConnect()

        const user = await User.findById(id)
        if (!user) {
          throw new Error("User not found")
        }

        // Update user fields
        Object.assign(user, input)
        await user.save()

        return user
      },
    },
  },
})
