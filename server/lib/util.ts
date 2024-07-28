import * as fs from 'fs/promises'
import path from 'path'
import {
  CaptionedImage,
  getImageFileName,
  ImagePurpose,
} from '@insta-cyborg/util'
import { STORAGE_PATH_MEDIA } from './config'
import { getAllUsedImageIds } from './state'

export const getImageFilePath = (
  { imageId, imageSource }: { imageId: string; imageSource: string },
  purpose: ImagePurpose | null = null,
  extension: string | null = null,
) =>
  path.join(
    STORAGE_PATH_MEDIA,
    getImageFileName(
      imageId,
      purpose,
      extension === null
        ? path.extname(imageSource).replace('.', '')
        : extension,
    ),
  )

export const getImageInfo = async (
  imageId: string,
): Promise<CaptionedImage | null> => {
  try {
    const file = await fs.readFile(
      path.join(STORAGE_PATH_MEDIA, `${imageId}.json`),
    )

    return JSON.parse(file.toString())
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}

export const getHighestPublishDate = async (): Promise<Date | null> => {
  const imageIds = getAllUsedImageIds()
  const images = await Promise.all(
    imageIds.map((imageId) => getImageInfo(imageId)),
  )
  const validImages = images.filter(
    (image) => image != null && image.publishAt,
  ) as Array<CaptionedImage>

  if (validImages.length === 0) {
    return null
  }

  validImages.sort((a, b) => a.publishAt.getTime() - b.publishAt.getTime())
  return validImages[0].publishAt
}

export const nextDayByWeekdayType = (
  baseDate: Date,
  weekdayType: number,
  sameDayOkay = false,
) => {
  let date = new Date(baseDate.getTime())
  date.setHours(12, 0, 0, 0)
  if (!sameDayOkay) {
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000)
  }
  while (date.getDay() !== weekdayType) {
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000)
  }
  return date
}
