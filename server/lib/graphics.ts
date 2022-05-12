import config from '@insta-cyborg/config'
import { DescribedImage, ImagePurpose, textForStory } from '@insta-cyborg/util'
import puppeteer, { Page } from 'puppeteer-core'
import sharp, { ResizeOptions } from 'sharp'
import { getImageFilePath } from './util'

const INSTAGRAM_IMAGE_BASE_SIZE = 1080
const INSTAGRAM_PORTRAIT_RATIO_MIN = 4 / 5
const INSTAGRAM_LANDSCAPE_RATIO_MAX = 16 / 9

const getOverlay = async (index: number) =>
  sharp(
    new URL('../resources/robota-export.png', import.meta.url)
      .toString()
      .replace('file://', ''),
  )
    .extract({
      width: INSTAGRAM_IMAGE_BASE_SIZE,
      height: INSTAGRAM_IMAGE_BASE_SIZE,
      left: 1080 * (2 - (index % 3)),
      top: 1080 * (54 - Math.floor(index / 3)),
    })
    .toBuffer()

export const applyOverlayToArtworkImage = async (
  imageSource: string,
  image: DescribedImage,
  index: number,
): Promise<string> => {
  const artworkImage = sharp(imageSource)

  const outputPath = getImageFilePath(
    image,
    ImagePurpose.POST_WITH_OVERLAY,
    'jpg',
  )

  let resizeStrategy: ResizeOptions = {
    height: INSTAGRAM_IMAGE_BASE_SIZE,
    width: INSTAGRAM_IMAGE_BASE_SIZE,
    fit: 'outside',
  }

  const metadata = await artworkImage.metadata()
  if (metadata.width === undefined || metadata.height === undefined) {
    throw Error('Failed to get image size.')
  }
  if (metadata.width / metadata.height < INSTAGRAM_PORTRAIT_RATIO_MIN) {
    resizeStrategy = {
      width: INSTAGRAM_IMAGE_BASE_SIZE,
      height: INSTAGRAM_IMAGE_BASE_SIZE / INSTAGRAM_PORTRAIT_RATIO_MIN,
      position: 'centre',
    }
  }
  if (metadata.width / metadata.height > INSTAGRAM_LANDSCAPE_RATIO_MAX) {
    resizeStrategy = {
      width: INSTAGRAM_IMAGE_BASE_SIZE * INSTAGRAM_LANDSCAPE_RATIO_MAX,
      height: INSTAGRAM_IMAGE_BASE_SIZE,
      position: 'centre',
    }
  }

  await artworkImage
    .resize(resizeStrategy)
    .composite([{ input: await getOverlay(index), gravity: 'center' }])
    .toFile(outputPath)

  return outputPath
}

const htmlToPng = async (html: string): Promise<Buffer> => {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--hide-scrollbars',
        '--disable-web-security',
      ],
      executablePath: '/usr/bin/google-chrome',
      defaultViewport: {
        height: 1920,
        width: 1080,
      },
    })
    const page: Page = await browser.newPage()
    await page.goto(new URL('../resources/empty.html', import.meta.url).href)
    await page.setContent(html)

    const screenshot = await page.screenshot({ type: 'png' })

    await browser.close()

    return screenshot as Buffer
  } catch (err) {
    if (browser) {
      await browser.close()
    }
    throw err
  }
}

export const composeStory = async (
  imageSource: string,
  image: DescribedImage,
) => {
  const storyBuffer = await htmlToPng(
    `
<!doctype html>
<html>
<head>
<style>
body {
  margin: 0; 
  height: 100vh;
  display: flex;
  flex-direction: column; 
  padding: 100px 40px 40px;
  box-sizing: border-box;
  
  background-color: black;
  
  color: white;
}
main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
}
img {
  max-height: 1100px;
  max-width: 100%;
}
#caption {  
  margin-top: 40px;
  width: 100%;

  font-family: 'Roboto'; /* "Nimbus Sans"; */
  font-weight: bold;
  font-size: 30px;
  text-align: left;
}
section {
  font-family: 'TeX Gyre Cursor';
  font-variant-ligatures: no-common-ligatures;
  font-size: 45px;
}
</style>
</head>
<body>
  <main>
    <img src="${imageSource}" />
    <div id="caption">@${config.instagramUsername}</divcaption>
  </main>
  <section>
  ${textForStory(image).replace(/\n/g, '<br />')}
  </section>
</body>
</html>`,
  )

  const storyFilePath = getImageFilePath(image, ImagePurpose.STORY, 'jpg')
  await sharp(storyBuffer).toFile(storyFilePath)
  return storyFilePath
}
