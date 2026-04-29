import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const editablePlantFields = [
  'Name',
  'CommanName',
  'Type',
  'Imgpath',
  'Uses',
  'MatureSize',
  'SunMoisture',
  'RestorationValue',
  'Description',
]

const jsonBodyLimit = 15 * 1024 * 1024

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = ''
    let didReject = false

    req.on('data', (chunk) => {
      body += chunk

      if (body.length > jsonBodyLimit && !didReject) {
        didReject = true
        reject(new Error('Upload is too large. Please use a smaller image.'))
        req.destroy()
      }
    })

    req.on('end', () => {
      if (didReject) return

      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        reject(new Error('Invalid request body.'))
      }
    })

    req.on('error', (error) => {
      if (!didReject) reject(error)
    })
  })

const readJsonFile = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content.replace(/^\uFEFF/, ''))
}

const parseImageDataUrl = (imageData) => {
  const match = String(imageData || '').match(
    /^data:(image\/(?:webp|jpeg|jpg|png));base64,([\s\S]+)$/,
  )

  if (!match) {
    throw new Error('Invalid image data.')
  }

  const mimeType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1]
  const extension =
    mimeType === 'image/webp' ? 'webp' : mimeType === 'image/png' ? 'png' : 'jpg'

  return {
    buffer: Buffer.from(match[2], 'base64'),
    extension,
  }
}

const addAdminPlantWriterMiddleware = (server) => {
  const root = server.config.root
  const plantsJsonPath = path.resolve(root, 'src/json/PlantsList.json')
  const plantsImagesDir = path.resolve(root, 'public/images/plants')

  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url || '/', 'http://localhost')
    const match = url.pathname.match(/^\/api\/admin\/plants\/([^/]+)$/)

    if (!match) {
      next()
      return
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed.' })
      return
    }

    try {
      const slug = decodeURIComponent(match[1])

      if (!/^[a-z0-9-]+$/i.test(slug)) {
        throw new Error('Invalid plant slug.')
      }

      const body = await readJsonBody(req)
      const plants = await readJsonFile(plantsJsonPath)
      const plantIndex = plants.findIndex((plant) => plant.slug === slug)

      if (plantIndex === -1) {
        sendJson(res, 404, { error: 'Plant not found.' })
        return
      }

      const nextPlant = { ...plants[plantIndex] }
      const plantUpdates = body.plant || {}

      editablePlantFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(plantUpdates, field)) {
          nextPlant[field] = plantUpdates[field]
        }
      })

      if (body.imageData) {
        const { buffer, extension } = parseImageDataUrl(body.imageData)
        const imageName = `${slug}.${extension}`
        const imagePath = path.resolve(plantsImagesDir, imageName)

        if (!imagePath.startsWith(`${plantsImagesDir}${path.sep}`)) {
          throw new Error('Invalid image path.')
        }

        await fs.mkdir(plantsImagesDir, { recursive: true })
        await fs.writeFile(imagePath, buffer)
        nextPlant.Imgpath = `./images/plants/${imageName}`
      }

      plants[plantIndex] = nextPlant
      await fs.writeFile(plantsJsonPath, `${JSON.stringify(plants, null, 4)}\n`)

      sendJson(res, 200, { plant: nextPlant })
    } catch (error) {
      sendJson(res, 400, {
        error: error.message || 'Unable to save plant.',
      })
    }
  })
}

const adminPlantWriter = () => ({
  name: 'admin-plant-writer',
  configureServer: addAdminPlantWriterMiddleware,
  configurePreviewServer: addAdminPlantWriterMiddleware,
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adminPlantWriter()],
})
