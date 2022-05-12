import {
  CaptionedImage,
  captionForImagePost,
  DescribedImage,
  shuffleArray,
  textForStory,
} from '@insta-cyborg/util'
import cors from 'cors'
import express from 'express'
import * as fs from 'fs/promises'
import * as path from 'path'
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
import { getImageFilePath } from './util'

const port = 3001

const app = express()
app.use(express.json())
app.use(cors())
app.use('/media', express.static(STORAGE_PATH_MEDIA))
app.get('/images', async (request, response) => {
  response.send(
    JSON.stringify({
      posted: getPostedImageIds(),
      available: getAvailableImageIds(),
    }),
  )
})
app.post('/images/generate', async (request, response) => {
  const usedImageIds = getAllUsedImageIds()
  const index = usedImageIds.length

  const notPostedImages = await getImages({ imageIdBlacklist: usedImageIds })
  // todo: instead of shuffling sort by date and sample with a strong bias for recency
  shuffleArray(notPostedImages)
  const image: DescribedImage &
    Partial<
      Pick<CaptionedImage, Exclude<keyof CaptionedImage, keyof DescribedImage>>
    > = notPostedImages[0]
  image.postCaption = captionForImagePost(image)
  image.storyText = textForStory(image)
  await fs.writeFile(
    getImageFilePath(image, null, 'json'),
    JSON.stringify(image),
  )
  const imagePath = await downloadImage(image)
  await applyOverlayToArtworkImage(imagePath, image, index)
  const storyPath = await composeStory(imagePath, image)
  pushAvailableImageId(image.imageId)
  response.send(JSON.stringify({ imageId: image.imageId }))
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
