import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'gift'

if (!uri) {
  console.error('Missing MONGODB_URI')
  process.exit(1)
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const collection = client.db(dbName).collection('media')

  const total = await collection.countDocuments()
  const photos = await collection.countDocuments({ name: /^Memories \d+\.jpg$/ })
  const hero = await collection.findOne(
    { name: 'IMG_5973.MP4' },
    { projection: { _id: 0, name: 1, mimeType: 1, size: 1, fileId: 1 } }
  )
  const music = await collection.findOne(
    { name: 'Album Page.mp3' },
    { projection: { _id: 0, name: 1, mimeType: 1, size: 1, fileId: 1 } }
  )

  const byType = await collection
    .aggregate([
      { $group: { _id: '$mimeType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray()

  console.log(
    JSON.stringify(
      {
        total,
        photos,
        hero,
        music,
        byType,
      },
      null,
      2
    )
  )
} catch (error) {
  console.error('Verification failed:', error)
  process.exit(1)
} finally {
  await client.close()
}
