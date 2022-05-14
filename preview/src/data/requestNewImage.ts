import config from '@insta-cyborg/config'
import { fetchOptionsWithAuth } from '@insta-cyborg/util'

const requestNewImage = async (): Promise<string> => {
  const request = await fetch(
    new URL('images/generate', config.instaCyborgServerOrigin).toString(),
    fetchOptionsWithAuth({
      method: 'POST',
    }),
  )

  if (!request.ok) {
    console.error(request)
    throw Error('Failed to request new image') // todo: error handling
  }

  return (await request.json()).imageId
}

export default requestNewImage
