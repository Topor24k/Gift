import { GridFSBucket, MongoClient } from 'mongodb'

type MongoCache = {
  client: MongoClient | null
  promise: Promise<MongoClient> | null
}

const globalCache = globalThis as typeof globalThis & { __mongoCache?: MongoCache }

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to Vercel environment variables.')
  }
  return uri
}

function getDbName(): string {
  return process.env.MONGODB_DB || 'gift'
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!globalCache.__mongoCache) {
    globalCache.__mongoCache = { client: null, promise: null }
  }

  if (globalCache.__mongoCache.client) {
    return globalCache.__mongoCache.client
  }

  if (!globalCache.__mongoCache.promise) {
    const client = new MongoClient(getMongoUri(), {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
    })
    globalCache.__mongoCache.promise = client.connect()
  }

  globalCache.__mongoCache.client = await globalCache.__mongoCache.promise
  return globalCache.__mongoCache.client
}

export async function getMediaCollection() {
  const client = await getMongoClient()
  return client.db(getDbName()).collection('media')
}

export async function getDb() {
  const client = await getMongoClient()
  return client.db(getDbName())
}

export async function getMediaBucket() {
  const db = await getDb()
  return new GridFSBucket(db, { bucketName: 'media' })
}
