import { setAuthorizationHeaderForFetch, sleep } from '@insta-cyborg/util'
import { fetchAndPublishImage, NO_IMAGES_AVAILABLE } from './actions'

process.on('SIGINT', () => {
  console.log('Bot terminating.')
  process.exit(1)
})

const mainLoop = async () => {
  try {
    await fetchAndPublishImage()
  } catch (error) {
    if (error.message !== NO_IMAGES_AVAILABLE) {
      throw error
    }
  }

  // todo: send out status report on Sunday (especially a warning if no image is ready)
}

setAuthorizationHeaderForFetch(process.env.INSTA_CYBORG_AUTHORIZATION)
while (true) {
  await mainLoop()
  await sleep(60)
}
