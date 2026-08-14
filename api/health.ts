import type { IncomingMessage, ServerResponse } from 'node:http'
import { getMediaCollection } from './_lib/mongodb.js'

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
  }

  try {
    const collection = await getMediaCollection()
    const count = await collection.estimatedDocumentCount()
    return sendJson(res, 200, {
      ok: true,
      db: process.env.MONGODB_DB || 'gift',
      mediaCount: count,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    return sendJson(res, 500, { ok: false, error: message })
  }
}
