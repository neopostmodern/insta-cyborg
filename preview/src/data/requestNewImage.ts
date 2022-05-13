import config from '@insta-cyborg/config'

const requestNewImage = async (): Promise<string> => {
  const request = await fetch(
    new URL('images/generate', config.instaCyborgServerOrigin).toString(),
    {
      method: 'POST',
    },
  )

  if (!request.ok) {
    console.error(request)
    throw Error('Failed to request new image') // todo: error handling
  }

  return (await request.json()).imageId
}

export default requestNewImage
