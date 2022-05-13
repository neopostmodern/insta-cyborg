import fs from 'fs'
import path from 'path'
import { STORAGE_PATH_DATA } from './config'

const stateCacheFilePath = path.join(STORAGE_PATH_DATA, 'state.json')
const STATE_VERSION = 1

interface State {
  version: number
  postedImageIds: Array<string>
  availableImageIds: Array<string>
}

const readState = (): State => {
  return JSON.parse(fs.readFileSync(stateCacheFilePath).toString())
}

const writeState = (state: State): void => {
  fs.writeFileSync(stateCacheFilePath, JSON.stringify(state))
}

const initializeState = (): void => {
  let state
  try {
    state = readState()
  } catch (error) {
    console.log('Failed to deserialize state', error)

    state = {
      version: STATE_VERSION,
      postedImageIds: [],
      availableImageIds: [],
    }
  }

  if (state.version !== STATE_VERSION) {
    if (state.version === 0) {
      state.availableImageIds = []
      state.version = 1
    }
    if (state.version !== STATE_VERSION) {
      throw Error('Not all necessary state migrations implemented yet')
    }
  }

  writeState(state)
}

initializeState()

export const getAllUsedImageIds = (): Array<string> => {
  const state = readState()
  return state.availableImageIds.concat(state.postedImageIds)
}

export const getPostedImageIds = (): Array<string> => readState().postedImageIds
export const pushPostedImageId = (postedImageId: string): void => {
  const state = readState()
  state.postedImageIds.push(postedImageId)
  writeState(state)
}

export const getAvailableImageIds = (): Array<string> =>
  readState().availableImageIds
export const pushAvailableImageId = (availableImageId: string): void => {
  const state = readState()
  writeState({
    ...state,
    availableImageIds: [...state.availableImageIds, availableImageId],
  })
}
export const popAvailableImageId = (availableImageId: string): void => {
  const state = readState()
  writeState({
    ...state,
    availableImageIds: state.availableImageIds.filter(
      (id) => id !== availableImageId,
    ),
  })
}
