import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set")
}

const uri = process.env.MONGODB_URI
const options = {}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, options)
    await cachedClient.connect()
  }

  cachedDb = cachedClient.db("vitamend")
  return cachedDb
}

export async function getClient(): Promise<MongoClient> {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, options)
    await cachedClient.connect()
  }
  return cachedClient
}
