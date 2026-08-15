import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GridFSBucket, MongoClient } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const assetsDir = path.join(projectRoot, 'assets')

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'gift'
const deleteSource = process.argv.includes('--delete-source')

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
    const db = client.db(MONGODB_DB)
    const collection = db.collection('media')
    const bucket = new GridFSBucket(db, { bucketName: 'media' })
    const entries = await fs.readdir(assetsDir, { withFileTypes: true })
    const files = entries.filter((entry) => entry.isFile()).sort((a, b) => a.name.localeCompare(b.name))
    const memoryFiles = files.filter((file) => /^photo_2026-08-15_.*\.jpg$/i.test(file.name))
    const memoryNames = new Map(memoryFiles.map((file, index) => [file.name, `Memories ${index + 1}.jpg`]))

    await collection.createIndex({ name: 1 }, { unique: true })

    let uploaded = 0
    for (const file of files) {
      const filePath = path.join(assetsDir, file.name)
      const data = await fs.readFile(filePath)
      const storedName = memoryNames.get(file.name) || file.name
      const mimeType = inferMimeType(storedName)

      const existing = await collection.findOne({ name: storedName }, { projection: { fileId: 1 } })
      if (existing?.fileId) {
        try {
          await bucket.delete(existing.fileId)
        } catch {
          // Ignore stale file delete errors and continue with fresh upload.
        }
      }

      const fileId = await new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(storedName, {
          contentType: mimeType,
          metadata: { name: storedName },
        })
        uploadStream.on('error', reject)
        uploadStream.on('finish', () => resolve(uploadStream.id))
        uploadStream.end(data)
      })

      await collection.updateOne(
        { name: storedName },
        {
          $set: {
            name: storedName,
            mimeType,
            size: data.length,
            fileId,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )

      uploaded += 1
      console.log(`Uploaded: ${storedName}`)
    }

    // Remove obsolete records from the pre-rename photo names, if they exist.
    const obsoleteMemories = await collection.find({ name: /^photo_2026-08-15_.*\.jpg$/i }, { projection: { fileId: 1 } }).toArray()
    for (const media of obsoleteMemories) {
      if (media.fileId) await bucket.delete(media.fileId).catch(() => undefined)
    }
    if (obsoleteMemories.length) {
      await collection.deleteMany({ name: /^photo_2026-08-15_.*\.jpg$/i })
    }

    const uploadedDocuments = await collection.countDocuments({ name: { $in: files.map((file) => memoryNames.get(file.name) || file.name) } })
    if (uploadedDocuments !== files.length) {
      throw new Error(`Upload verification failed: expected ${files.length} documents, found ${uploadedDocuments}.`)
    }

    console.log(`Done. Uploaded/updated ${uploaded} files into ${MONGODB_DB}.media`)

    if (deleteSource) {
      await Promise.all(files.map((file) => fs.unlink(path.join(assetsDir, file.name))))
      console.log(`Deleted ${files.length} uploaded source files from assets.`)
    }
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error('Upload failed:', error)
  process.exit(1)
})
