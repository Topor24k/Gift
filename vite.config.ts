import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { GridFSBucket, MongoClient } from 'mongodb'

function mongoMediaPlugin(uri: string | undefined, dbName: string): Plugin {
  let client: MongoClient | undefined

  return {
    name: 'mongo-media',
    configureServer(server) {
      server.middlewares.use('/api/media', async (req: IncomingMessage, res: ServerResponse, next) => {
        if (!uri) {
          res.statusCode = 500
          res.end('MONGODB_URI is not set. Add it to .env.local.')
          return
        }

        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Allow', 'GET')
          res.end()
          return
        }

        try {
          const name = new URL(req.url || '/', 'http://localhost').searchParams.get('name')
          if (!name) {
            res.statusCode = 400
            res.end('A media name is required.')
            return
          }

          client ??= await new MongoClient(uri).connect()
          const db = client.db(dbName)
          const media = await db.collection('media').findOne({ name })
          if (!media?.fileId) {
            res.statusCode = 404
            res.end('Media not found.')
            return
          }

          res.statusCode = 200
          res.setHeader('Content-Type', media.mimeType || 'application/octet-stream')
          res.setHeader('Content-Length', String(media.size))
          res.setHeader('Cache-Control', 'no-cache')
          new GridFSBucket(db, { bucketName: 'media' }).openDownloadStream(media.fileId).pipe(res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [react(), tailwindcss(), mongoMediaPlugin(env.MONGODB_URI, env.MONGODB_DB || 'gift')],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 5173),
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 4173),
  },
  }
})
