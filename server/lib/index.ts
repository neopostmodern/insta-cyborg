import {
  CaptionedImage,
  captionForImagePost,
  DescribedImage,
  shuffleArray,
  textForStory,
} from '@insta-cyborg/util'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import * as fs from 'fs/promises'
import * as path from 'path'
import pino_http from 'pino-http'
import { STORAGE_PATH_MEDIA } from './config'
import { applyOverlayToArtworkImage, composeStory } from './graphics'
import { downloadImage, getImages } from './portfolio'
import {
  getAllUsedImageIds,
  getAvailableImageIds,
  getPostedImageIds,
  popAvailableImageId,
  pushAvailableImageId,
  pushPostedImageId,
} from './state'
import {
  getHighestPublishDate,
  getImageFilePath,
  nextDayByWeekdayType,
} from './util'
import { logger } from './logger'

const port = 3001

const app = express()
app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: true,
  }),
)
app.use(cookieParser())
app.use(pino_http({ logger }))
app.use((request, response, next) => {
  if (
    !request.path.startsWith('/auth/') &&
    (request.cookies.authorization || request.headers.authorization) !==
      process.env.INSTA_CYBORG_AUTHORIZATION
  ) {
    response.status(401).send('Need to provide authorization header or cookie')
    return
  }
  next()
})
app.use('/media', express.static(STORAGE_PATH_MEDIA))
app.post('/auth/login', (request, response) => {
  if (!request.headers.authorization) {
    response.status(400).send('No authorization header provided')
    return
  }
  if (
    request.headers.authorization !== process.env.INSTA_CYBORG_AUTHORIZATION
  ) {
    response.status(401).send('Invalid authorization')
    return
  }
  response.cookie('authorization', request.headers.authorization, {
    expires: new Date(Date.now() + 1000 * 3600 * 24 * 30),
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  })
  response.sendStatus(204)
})
app.post('/auth/logout', (request, response) => {
  response.cookie('authorization', '', {
    maxAge: 0,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  })
  response.sendStatus(204)
})
app.get('/images', (request, response) => {
  response.send(
    JSON.stringify({
      posted: getPostedImageIds(),
      available: getAvailableImageIds(),
    }),
  )
})
app.post('/images/generate', async (request, response) => {
  try {
    logger.trace('Start image generation procedure...')
    const usedImageIds = getAllUsedImageIds()
    logger.trace(`Acquired used image IDs: ${usedImageIds.join(', ')}`)
    const index = usedImageIds.length

    logger.trace('Fetch images and filter for unused images')
    const notPostedImages = await getImages({ imageIdBlacklist: usedImageIds })
    logger.trace(`Acquired ${notPostedImages.length} not posted images`)
    // todo: instead of shuffling sort by date and sample with a strong bias for recency
    shuffleArray(notPostedImages)
    const image: DescribedImage &
      Partial<
        Pick<
          CaptionedImage,
          Exclude<keyof CaptionedImage, keyof DescribedImage>
        >
      > = notPostedImages[0]
    logger.trace('Selected image', image)
    image.postCaption = captionForImagePost(image)
    logger.trace('Generated post caption', image.postCaption)
    image.storyText = textForStory(image)
    logger.trace('Generated story text', image.storyText)
    let highestPublishDate = await getHighestPublishDate()
    if (highestPublishDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (highestPublishDate.getTime() < today.getTime()) {
        // if the system got out of schedule, don't continue in the past - jump to next scheduled date
        highestPublishDate = null
      }
    }
    const publishAt = nextDayByWeekdayType(
      highestPublishDate || new Date(),
      1, // Monday
      !highestPublishDate,
    )
    publishAt.setHours(11, 0, 0, 0)
    image.publishAt = publishAt
    await fs.writeFile(
      getImageFilePath(image, null, 'json'),
      JSON.stringify(image),
    )
    logger.trace('Image metadata saved.')
    const imagePath = await downloadImage(image)
    logger.trace(`Image downloaded to ${imagePath}.`)
    await applyOverlayToArtworkImage(imagePath, image, index)
    // const storyPath = await composeStory(imagePath, image)
    pushAvailableImageId(image.imageId)
    response.send(JSON.stringify({ imageId: image.imageId }))
  } catch (exception) {
    console.error(exception)
    response.sendStatus(500)
  }
})
app.put('/images/:imageId', async (request, response) => {
  const { imageId } = request.params
  const usedImageIds = getAllUsedImageIds()
  if (!usedImageIds.includes(imageId)) {
    response.status(404).send(`No image with ID '${imageId}'`)
  }
  const imageDiff: Partial<CaptionedImage> = request.body
  if ('imageId' in imageDiff) {
    throw Error("Can't change image ID!")
  }
  const image: CaptionedImage = JSON.parse(
    (
      await fs.readFile(
        getImageFilePath({ imageId, imageSource: '' }, null, 'json'),
      )
    ).toString(),
  )
  const updatedImage = { ...image, ...imageDiff }
  await fs.writeFile(
    getImageFilePath(updatedImage, null, 'json'),
    JSON.stringify(updatedImage),
  )
  response.send(updatedImage)
})
app.post('/images/:imageId/mark-posted', (request, response) => {
  const { imageId } = request.params
  const usedImageIds = getAllUsedImageIds()
  if (!usedImageIds.includes(imageId)) {
    response.status(404).send(`No image with ID '${imageId}'`)
  }

  popAvailableImageId(imageId)
  pushPostedImageId(imageId)

  response.sendStatus(204)
})
app.delete('/images/:imageId', async (request, response) => {
  const { imageId } = request.params

  const postedImageIds = getPostedImageIds()
  if (postedImageIds.includes(imageId)) {
    response.status(403).send(`Not allowed to delete already posted picture`)
  }

  const usedImageIds = getAllUsedImageIds()
  if (!usedImageIds.includes(imageId)) {
    response.status(404).send(`No image with ID '${imageId}'`)
  }

  // todo: allow preserving files
  // todo: allow blacklisting ID

  const allMediaFiles = await fs.readdir(STORAGE_PATH_MEDIA)
  await Promise.all(
    allMediaFiles
      .filter((mediaFile) => mediaFile.includes(imageId))
      .map((mediaFile) => fs.unlink(path.join(STORAGE_PATH_MEDIA, mediaFile))),
  )

  popAvailableImageId(imageId)

  response.sendStatus(204)
})

await app.listen(port)
console.log(`Insta-Cyborg server listening at :${port}`)
