export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
    path?: string[]
  }>
}

export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>,
  options?: RequestInit,
): Promise<GraphQLResponse<T>> {
  try {
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      ...options,
    })

    return await response.json()
  } catch (error) {
    console.error("GraphQL request failed:", error)
    return {
      errors: [
        {
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      ],
    }
  }
}

// Example queries
export const queries = {
  getDonations: `
    query GetDonations($status: String, $limit: Int, $offset: Int) {
      donations(status: $status, limit: $limit, offset: $offset) {
        id
        firstName
        lastName
        email
        status
        medicines {
          name
          quantity
          expiryDate
        }
        creditsEarned
        createdAt
      }
    }
  `,

  getUserDonations: `
    query GetUserDonations($userId: ID!) {
      userDonations(userId: $userId) {
        id
        status
        medicines {
          name
          quantity
          expiryDate
        }
        creditsEarned
        createdAt
      }
    }
  `,

  getStats: `
    query GetStats {
      stats {
        totalDonations
        totalUsers
        medicinesDistributed
        pendingVerifications
      }
    }
  `,
}

export const mutations = {
  createDonation: `
    mutation CreateDonation($input: DonationInput!) {
      createDonation(input: $input) {
        id
        status
        createdAt
      }
    }
  `,

  updateDonationStatus: `
    mutation UpdateDonationStatus($id: ID!, $status: String!, $notes: String) {
      updateDonationStatus(id: $id, status: $status, notes: $notes) {
        id
        status
        verificationNotes
        creditsEarned
      }
    }
  `,
}
