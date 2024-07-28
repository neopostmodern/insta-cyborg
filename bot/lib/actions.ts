import {
  fetchImageData,
  fetchImageList,
  ImagePurpose,
} from '@insta-cyborg/util'
import { postImagePost, updateLinkInBio } from './instagram'
import { clearTempFolder, downloadImageFile, markImagePosted } from './network'

export const NO_IMAGES_AVAILABLE = 'No image available to post'

export const fetchAndPublishImage = async () => {
  const allImages = await fetchImageList()
  const imageId = allImages.available[0]
  if (!imageId) {
    throw Error(NO_IMAGES_AVAILABLE)
  }
  const imageData = await fetchImageData(imageId)
  if (new Date(imageData.publishAt).getTime() > new Date().getTime()) {
    return
  }
  console.log(`Will publish image ${imageId}...`)
  const postWithOverlayFilePath = await downloadImageFile(
    imageId,
    ImagePurpose.POST_WITH_OVERLAY,
  )
  await postImagePost(postWithOverlayFilePath, imageData.postCaption)
  // await postStory(storyPath, { withLatestPost: true })
  await markImagePosted(imageId)
  await updateLinkInBio(imageData.projectUrl)
  await clearTempFolder()
  console.log(`Publishing image ${imageId} complete.`)
}
