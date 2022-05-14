import {
  fetchImageData,
  fetchImageList,
  ImagePurpose,
  setAuthorizationHeaderForFetch,
} from '@insta-cyborg/util'
import { postImagePost, updateLinkInBio } from './instagram'
import { clearTempFolder, downloadImageFile, markImagePosted } from './network'

setAuthorizationHeaderForFetch(process.env.INSTA_CYBORG_AUTHORIZATION)
const allImages = await fetchImageList()
const imageId = allImages.available[0]
if (!imageId) {
  throw Error('No image available to post')
}
const imageData = await fetchImageData(imageId)
const postWithOverlayFilePath = await downloadImageFile(
  imageId,
  ImagePurpose.POST_WITH_OVERLAY,
)
await postImagePost(postWithOverlayFilePath, imageData.postCaption)
// await postStory(storyPath, { withLatestPost: true })
await markImagePosted(imageId)
await updateLinkInBio(imageData.projectUrl)
await clearTempFolder()
process.exit(0)
