import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Binary, MongoClient } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const assetsDir = path.join(projectRoot, 'assets')

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'gift'

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Set it before running upload:assets.')
  process.exit(1)
}

function inferMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.mp3') return 'audio/mpeg'
  if (ext === '.mp4') return 'video/mp4'
  return 'application/octet-stream'
}

async function main() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()

  try {
    const collection = client.db(MONGODB_DB).collection('media')
    const entries = await fs.readdir(assetsDir, { withFileTypes: true })
    const files = entries.filter((entry) => entry.isFile())

    let uploaded = 0
    for (const file of files) {
      const filePath = path.join(assetsDir, file.name)
      const data = await fs.readFile(filePath)
      const mimeType = inferMimeType(file.name)

      await collection.updateOne(
        { name: file.name },
        {
          $set: {
            name: file.name,
            mimeType,
            size: data.length,
            data: new Binary(data),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )

      uploaded += 1
      console.log(`Uploaded: ${file.name}`)
    }

    await collection.createIndex({ name: 1 }, { unique: true })
    console.log(`Done. Uploaded/updated ${uploaded} files into ${MONGODB_DB}.media`) 
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error('Upload failed:', error)
  process.exit(1)
})
