import config from '@insta-cyborg/config'
import { CaptionedImage, fetchOptionsWithAuth } from '@insta-cyborg/util'

const updateImage = async (
  imageId: string,
  imageDiff: Partial<CaptionedImage>,
): Promise<CaptionedImage> => {
  const request = await fetch(
    new URL(`images/${imageId}`, config.instaCyborgServerOrigin).toString(),
    fetchOptionsWithAuth({
      method: 'PUT',
      body: JSON.stringify(imageDiff),
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  )

  if (!request.ok) {
    console.error(request)
    throw Error(`Failed to update image ${imageId}`) // todo: error handling
  }

  return await request.json()
}

export default updateImage
