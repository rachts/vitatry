import { createYoga } from "graphql-yoga"
import { schema } from "@/lib/graphql/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Request, Response },
  context: async ({ request }) => {
    // Add authentication to context
    const session = await getServerSession(authOptions)
    return {
      request,
      user: session?.user,
    }
  },
})

export { handleRequest as GET, handleRequest as POST }
