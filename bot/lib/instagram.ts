import * as fs from 'fs'
import { PostingStoryPhotoOptions } from 'instagram-private-api'
import { StickerBuilder } from 'instagram-private-api/dist/sticker-builder'
import { getInstagramClient } from './instagramClient'

export const postImagePost = async (imageFilePath: string, caption: string) => {
  const instagramClient = await getInstagramClient()

  const publishResult = await instagramClient.publish.photo({
    file: await fs.readFileSync(imageFilePath),
    caption,
  })

  console.log('Published post', publishResult)
}

export const postStory = async (
  storyImageFilePath: string,
  { withLatestPost = false } = {},
) => {
  const instagramClient = await getInstagramClient()

  const storyOptions: PostingStoryPhotoOptions = {
    file: fs.readFileSync(storyImageFilePath),
  }

  if (withLatestPost) {
    storyOptions.stickerConfig = new StickerBuilder().add(
      StickerBuilder.attachmentFromMedia(
        (await instagramClient.feed.timeline().items())[0],
        {
          width: 1.2,
          height: 0.6,
        },
      ).center(),
    )
  }

  const storyPublishResult = await instagramClient.publish.story(storyOptions)

  console.log('Published story', storyPublishResult)
}

// INBOX
// const inbox = await ig.feed.directInbox().items();
// console.dir(inbox[0]);
// { read_state: 0 (read) | 1 (unread) }

export const updateLinkInBio = async (newUrl: string) => {
  const ig = await getInstagramClient()

  const currentUser = await ig.account.currentUser()
  // console.log(currentUser)
  const accountChangeResponse = await ig.account.editProfile({
    external_url: newUrl,
    gender: currentUser.gender.toString(),
    phone_number: currentUser.phone_number,
    username: currentUser.username,
    first_name: currentUser.full_name, // NOTE: Should this key actually be "full_name"?
    biography: currentUser.biography,
    email: currentUser.email,
  })
  console.log('Updated account', accountChangeResponse)
}

// NOTIFICATIONS
// const news = await ig.news.inbox()
// follow suggestions news.aymf.items
// console.log(news, )
