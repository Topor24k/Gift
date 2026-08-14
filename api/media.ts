import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb, getMediaBucket } from './_lib/mongodb'

type MediaDoc = {
  _id: unknown
  name: string
  mimeType: string
  size: number
  fileId: unknown
  updatedAt?: Date
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getRequestUrl(req: IncomingMessage): URL {
  const host = req.headers.host || 'localhost'
  return new URL(req.url || '/', `http://${host}`)
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return sendJson(res, 405, { error: 'Method Not Allowed' })
  }

  try {
    const url = getRequestUrl(req)
    const name = url.searchParams.get('name')
    const prefix = url.searchParams.get('prefix') || ''
    const db = await getDb()
    const collection = db.collection<MediaDoc>('media')

    if (name) {
      const doc = await collection.findOne<MediaDoc>(
        { name }
      )

      if (!doc || !doc.fileId) {
        return sendJson(res, 404, { error: 'Media not found' })
      }

      const etag = `"${doc.name}-${doc.size}"`
      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304
        return res.end()
      }

      res.statusCode = 200
      res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream')
      res.setHeader('Content-Length', String(doc.size))
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      res.setHeader('ETag', etag)
      if (doc.updatedAt) {
        res.setHeader('Last-Modified', doc.updatedAt.toUTCString())
      }

      const bucket = await getMediaBucket()
      const stream = bucket.openDownloadStream(doc.fileId as never)

      stream.on('error', () => {
        if (!res.headersSent) {
          sendJson(res, 500, { error: 'Failed to stream media file' })
        } else {
          res.end()
        }
      })

      return stream.pipe(res)
    }

    const filter = prefix
      ? { name: { $regex: `^${escapeRegex(prefix)}` } }
      : {}

    const files = await collection
      .find(filter, { projection: { _id: 0, name: 1, mimeType: 1, size: 1 }, sort: { name: 1 } })
      .toArray()

    return sendJson(res, 200, { files })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    return sendJson(res, 500, { error: message })
  }
}
