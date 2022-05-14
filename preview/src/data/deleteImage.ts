import config from '@insta-cyborg/config'
import { fetchOptionsWithAuth } from '@insta-cyborg/util'

const deleteImage = async (imageId: string): Promise<void> => {
  const request = await fetch(
    new URL(`images/${imageId}`, config.instaCyborgServerOrigin).toString(),
    fetchOptionsWithAuth({
      method: 'DELETE',
    }),
  )

  if (!request.ok) {
    console.error(request)
    throw Error(`Failed to update image ${imageId}`) // todo: error handling
  }
}

export default deleteImage
