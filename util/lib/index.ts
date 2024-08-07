import config from '@insta-cyborg/config'

export type DescribedImage = {
  projectUrl: string
  projectImageIds: Array<string>
  projectTags: Array<string>
  workTitle: string
  medium?: string
  imageDescription: string
  year: number
  imageId: string
  imageSource: string
}
export type CaptionedImage = DescribedImage & {
  postCaption: string
  storyText: string
  publishAt: Date
}
export type AllImagesData = { posted: Array<string>; available: Array<string> }

export const createRelativeDirectoryIfNotExists = async (
  folderUrl: URL,
): Promise<string> => {
  // the callback is necessary to bypass browser checks :shrug:
  const { mkdir } = await import(/* @vite-ignore */ (() => 'fs/promises')())
  try {
    await mkdir(folderUrl)
  } catch (error) {
    if ((error as any)?.code !== 'EEXIST') {
      throw error
    }
  }
  return folderUrl.toString().replace('file://', '')
}

/**
 * Shuffle an array in place
 * @param array Array to shuffle
 */
export const shuffleArray = <T>(array: Array<T>): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export const INSTAGRAM_TAGS = ['clemensschöll', 'mediaart']

export const textForStory = ({
  workTitle,
  imageDescription,
  year,
}: DescribedImage): string =>
  `${workTitle}
${year}

${imageDescription}
Link in bio for more`

export const captionForImagePost = ({
  workTitle,
  imageDescription,
  year,
  medium,
}: DescribedImage): string =>
  `${workTitle}

${medium ? medium + ', ' : ''}${year}
${imageDescription}

Link in bio for more

${INSTAGRAM_TAGS.map((tag) => `#${tag}`).join(' ')}`

export const AUTHORIZATION_MISSING = 'AUTHORIZATION_MISSING'

let _authorizationHeader
export const setAuthorizationHeaderForFetch = (authentication: string) => {
  _authorizationHeader = authentication
}

export const fetchOptionsWithAuth = (
  fetchOptions: RequestInit = {},
): RequestInit => ({
  credentials: 'include',
  ...fetchOptions,
  headers: {
    authorization: _authorizationHeader,
    ...fetchOptions.headers,
  },
})

export const fetchImageList = async (): Promise<AllImagesData> => {
  const response = await fetch(
    config.instaCyborgServerOrigin + '/images',
    fetchOptionsWithAuth(),
  )
  if (!response.ok) {
    const errorMessage = await response.text()
    if (response.status === 401) {
      throw new Error(AUTHORIZATION_MISSING)
    }
    console.error(errorMessage)
    throw new Error(
      `${response.status} (${response.statusText}) – ${response.url}`,
    )
  }
  return response.json()
}

export const fetchImageData = async (
  imageId: string,
): Promise<CaptionedImage> => {
  const response = await fetch(
    `${config.instaCyborgServerOrigin}/media/${imageId}.json`,
    fetchOptionsWithAuth(),
  )
  if (!response.ok) {
    console.error(await response.text())
    throw new Error(
      `${response.status} (${response.statusText}) – ${response.url}`,
    )
  }
  return response.json()
}

export enum ImagePurpose {
  SOURCE = 'source',
  POST_WITH_OVERLAY = 'post-overlay',
  STORY = 'story',
}
export const getImageFileName = (
  imageId: string,
  purpose: ImagePurpose | null = null,
  extension: string = 'jpg',
) => imageId + (purpose === null ? '' : '_' + purpose) + ('.' + extension)

export const getImageUrl = (...args: Parameters<typeof getImageFileName>) =>
  config.instaCyborgServerOrigin +
  '/media/' +
  getImageFileName.apply(null, args)

export const sleep = (seconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000))
