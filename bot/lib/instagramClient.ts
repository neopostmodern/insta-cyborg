import config from '@insta-cyborg/config'
import { createRelativeDirectoryIfNotExists } from '@insta-cyborg/util'
import 'dotenv/config'
import fs from 'fs'
import { IgApiClient } from 'instagram-private-api'
import * as path from 'path'

if (!process.env.IG_PASSWORD) {
  throw Error('IG_PASSWORD not set in ENV')
}

const CACHE_DIR_PATH = await createRelativeDirectoryIfNotExists(
  new URL('../data/', import.meta.url),
)
const sessionCacheFilePath = path.join(CACHE_DIR_PATH, 'session-cache.json')

const saveInstagramSession = (data: object) => {
  fs.writeFileSync(sessionCacheFilePath, JSON.stringify(data))
  return data
}

const loadInstagramSession = () => {
  return JSON.parse(fs.readFileSync(sessionCacheFilePath).toString())
}

let instagramClient: IgApiClient
export const getInstagramClient = async (): Promise<IgApiClient> => {
  if (instagramClient) {
    return instagramClient
  }

  instagramClient = new IgApiClient()
  instagramClient.state.generateDevice(config.instagramUsername)

  // This function executes after every request
  instagramClient.request.end$.subscribe(async () => {
    const serialized = await instagramClient.state.serialize()
    delete serialized.constants // this deletes the version info, so you'll always use the version provided by the library
    saveInstagramSession(serialized)
  })

  try {
    await instagramClient.state.deserialize(loadInstagramSession())
  } catch (error) {
    console.log('Failed to load cached Instagram session', error)
  }

  try {
    const currentUser = await instagramClient.account.currentUser()
    if (currentUser.username != config.instagramUsername) {
      throw Error('Wrong user')
    }
  } catch (error) {
    console.log('Need to log in', error)

    // This call will provoke request.end$ stream
    const auth = await instagramClient.account.login(
      config.instagramUsername,
      process.env.IG_PASSWORD,
    )
    console.log('Authenticated', auth)
  }

  return instagramClient
}
