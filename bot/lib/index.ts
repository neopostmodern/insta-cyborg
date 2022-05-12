import {
  fetchImageData,
  fetchImageList,
  ImagePurpose,
} from '@insta-cyborg/util'
import { postImagePost, updateLinkInBio } from './instagram'
import { clearTempFolder, downloadImageFile, markImagePosted } from './network'

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
