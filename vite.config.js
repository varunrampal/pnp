/* global process */
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import resendQuoteHandler from './api/quote-resend.js'

const editablePlantFields = [
  'Name',
  'CommanName',
  'Type',
  'IsAdvisable',
  'IsOrnamental',
  'Imgpath',
  'Uses',
  'MatureSize',
  'Sun',
  'Soil',
  'Moisture',
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

const normalizePlantImagePath = (imagePath) =>
  String(imagePath || '')
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')

const findPlantIndex = (plants, slug, id) => {
  const matches = plants
    .map((plant, index) => ({ plant, index }))
    .filter(({ plant }) => plant.slug === slug)

  if (!matches.length) {
    return { index: -1 }
  }

  if (id != null) {
    const match = matches.find(({ plant }) => String(plant.id) === String(id))
    return { index: match?.index ?? -1 }
  }

  if (matches.length > 1) {
    return {
      error: 'Plant id is required because multiple records use this slug.',
      index: -1,
      statusCode: 409,
    }
  }

  return { index: matches[0].index }
}

const plantImageFile = (plantsImagesDir, imagePath) => {
  const normalizedPath = normalizePlantImagePath(imagePath)
  const lowerPath = normalizedPath.toLowerCase()
  const plantsImagePrefix = 'images/plants/'

  if (
    !lowerPath ||
    lowerPath === `${plantsImagePrefix}default.jpg` ||
    !lowerPath.startsWith(plantsImagePrefix)
  ) {
    return null
  }

  const imageName = normalizedPath.slice(plantsImagePrefix.length)

  if (!imageName || imageName.includes('/')) {
    return null
  }

  const filePath = path.resolve(plantsImagesDir, imageName)
  const relativePath = path.relative(plantsImagesDir, filePath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Invalid image path.')
  }

  return {
    comparisonPath: lowerPath,
    filePath,
    publicPath: `./${normalizedPath}`,
  }
}

const deletePlantImageIfUnused = async (deletedPlant, remainingPlants, plantsImagesDir) => {
  const imageFile = plantImageFile(plantsImagesDir, deletedPlant.Imgpath)

  if (!imageFile) {
    return null
  }

  const isStillUsed = remainingPlants.some(
    (plant) =>
      normalizePlantImagePath(plant.Imgpath).toLowerCase() === imageFile.comparisonPath,
  )

  if (isStillUsed) {
    return null
  }

  await fs.rm(imageFile.filePath, { force: true })
  return imageFile.publicPath
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

    try {
      const slug = decodeURIComponent(match[1])

      if (!/^[a-z0-9-]+$/i.test(slug)) {
        throw new Error('Invalid plant slug.')
      }

      if (req.method !== 'POST' && req.method !== 'DELETE') {
        sendJson(res, 405, { error: 'Method not allowed.' })
        return
      }

      const body = await readJsonBody(req)
      const plants = await readJsonFile(plantsJsonPath)
      const plantUpdates = body.plant || {}
      const { error, index: plantIndex, statusCode } = findPlantIndex(
        plants,
        slug,
        plantUpdates.id ?? body.id,
      )

      if (error) {
        sendJson(res, statusCode || 400, { error })
        return
      }

      if (plantIndex === -1) {
        sendJson(res, 404, { error: 'Plant not found.' })
        return
      }

      if (req.method === 'DELETE') {
        const [deletedPlant] = plants.splice(plantIndex, 1)
        const deletedImage = await deletePlantImageIfUnused(
          deletedPlant,
          plants,
          plantsImagesDir,
        )

        await fs.writeFile(plantsJsonPath, `${JSON.stringify(plants, null, 4)}\n`)

        sendJson(res, 200, { deletedImage, plant: deletedPlant })
        return
      }

      const nextPlant = { ...plants[plantIndex] }

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

const localQuoteApi = (mode) => ({
  name: 'local-quote-api',
  configureServer(server) {
    const environment = loadEnv(mode, process.cwd(), '')
    ;['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'RESEND_FROM_NAME', 'QUOTE_RECIPIENT_EMAIL', 'QUOTE_ALLOWED_ORIGINS'].forEach((name) => {
      if (environment[name]) process.env[name] = environment[name]
    })
    server.middlewares.use('/api/quote-resend.php', (request, response) => {
      let rawBody = ''
      request.on('data', chunk => {
        rawBody += chunk
        if (rawBody.length > 4 * 1024 * 1024) request.destroy()
      })
      request.on('end', async () => {
        try {
          request.body = rawBody ? JSON.parse(rawBody) : {}
          response.status = statusCode => { response.statusCode = statusCode; return response }
          response.json = payload => { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(payload)) }
          await resendQuoteHandler(request, response)
        } catch (error) {
          console.error('Local quote API failed:', error)
          sendJson(response, 400, { error: 'The quote request was invalid.' })
        }
      })
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), adminPlantWriter(), localQuoteApi(mode)],
}))
