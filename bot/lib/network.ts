import config from '@insta-cyborg/config'
import {
  createRelativeDirectoryIfNotExists,
  getImageFileName,
  getImageUrl,
  ImagePurpose,
} from '@insta-cyborg/util'
import * as fs from 'fs/promises'
import * as path from 'path'

const IMAGE_TEMP_FOLDER_PATH = await createRelativeDirectoryIfNotExists(
  new URL(`../temp-media/`, import.meta.url),
)

export const downloadImageFile = async (
  imageId: string,
  purpose: ImagePurpose,
): Promise<string> => {
  const result = await fetch(getImageUrl(imageId, purpose))
  if (!result.ok) {
    throw Error('Download failed')
  }
  const filePath = path.join(
    IMAGE_TEMP_FOLDER_PATH,
    getImageFileName(imageId, purpose),
  )
  await fs.writeFile(
    filePath,
    Buffer.from(await (await result.blob()).arrayBuffer()),
  )
  return filePath

  // todo: use streams
  // const fileStream = fs.createWriteStream(
  //   path.join(IMAGE_TEMP_FOLDER_PATH, getImageFileName(imageId, purpose)),
  // )
  // await new Promise((resolve, reject) => {
  //   Readable.fromWeb(res.body).pipeTo(fileStream as any)
  //   // res.body.on("error", reject);
  //   fileStream.on('finish', resolve)
  // })
}

export const markImagePosted = async (imageId: string): Promise<void> => {
  const result = await fetch(
    `${config.instaCyborgServerOrigin}/images/${imageId}/mark-posted`,
    {
      method: 'POST',
    },
  )
  if (!result.ok) {
    throw new Error(
      `Failed to mark image as posted: ${result.statusText} (${result.status})`,
    )
  }
}

export const clearTempFolder = async () =>
  fs.rm(IMAGE_TEMP_FOLDER_PATH, { recursive: true, force: true })
