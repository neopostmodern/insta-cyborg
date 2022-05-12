import config from "@insta-cyborg/config";
import { DescribedImage, ImagePurpose } from "@insta-cyborg/util";
import { createWriteStream, promises as fs } from "fs";
import https from "https";
import simpleDDP from "simpleddp";
import ws from "ws";
import { getImageFilePath } from "./util";

const ddp = new simpleDDP({
  endpoint: config.portfolioDdpEndpoint,
  SocketConstructor: ws,
});

interface Post {
  _id: string;
  identifier: string;
  title: string;
  tags: Array<string>;
  published: true;
  date: Date;
  content: string;
  imageIds: Array<string>;
  createdAt: Date;
  styles: string;
  updatedAt: string;
}

interface Image {
  _id: string;
  versions: {
    [format: string]: {
      path: string;
      extension: string;
      sizeName: string;
    };
  };
  meta: {
    sizes: {
      [format: string]: unknown;
    };
    sizesReady: boolean;
  };
}

const getPortfolioData = async (): Promise<{
  posts: Array<Post>;
  images: Array<Image>;
}> =>
  ddp.call("bericht.posts.public", {
    __userId: "",
    tag: ["portfolio"],
  }) as any;

const imageMarkdownRegex = /!\[([^\]]*)]\(\*([^)/]+)(\/\w+)?\)/g;
const mediumRegex = /class="art-medium">([^<]+)</i;

type UndescribedImage = Omit<DescribedImage, "postCaption" | "storyText">;
export const getImages = async ({
  imageIdBlacklist = [],
}: {
  imageIdBlacklist?: Array<string>;
} = {}): Promise<Array<UndescribedImage>> => {
  const { posts, images } = await getPortfolioData(); // todo: also call for 'art' tag and concatenate

  return posts
    .map((post) => {
      const year = post.date.getFullYear();

      const medium = post.content.match(mediumRegex)?.[1];

      return [...post.content.matchAll(imageMarkdownRegex)]
        .filter(([, , imageId]) => !imageIdBlacklist.includes(imageId))
        .map(
          ([, imageDescription, imageId]): Omit<
            DescribedImage,
            "imageSource"
          > => ({
            year,
            workTitle: post.title,
            projectUrl: `${config.portfolioOrigin}/portfolio/${post.identifier}`,
            projectImageIds: post.imageIds,
            projectTags: post.tags,
            medium,
            imageDescription,
            imageId,
          })
        )
        .map(({ imageId, ...data }) => {
          const image = images.find(({ _id }) => _id === imageId);
          if (!image) {
            console.warn(`Couldn't find image for ${imageId}`);
            return null;
          }
          if (!image.meta.sizesReady) {
            return null;
          }
          const imageVersions = Object.keys(image.versions);
          const imageVersionMaxSize = imageVersions[imageVersions.length - 1];
          const imageSource = `${
            config.portfolioOrigin
          }/images/${imageVersionMaxSize}-${imageId}.${
            imageVersionMaxSize.split("-")[1]
          }`;
          return { imageId, imageSource, ...data };
        })
        .filter((imageOrNull) =>
          Boolean(imageOrNull)
        ) as Array<UndescribedImage>;
    })
    .flat();
};

export const downloadImage = async (image: DescribedImage): Promise<string> => {
  const { imageSource } = image;
  const filePath = getImageFilePath(image, ImagePurpose.SOURCE);
  const file = await createWriteStream(filePath);

  return new Promise<string>((resolve, reject) => {
    https
      .get(imageSource, function (response) {
        response.pipe(file);
        file.on("finish", async () => {
          await file.close();
          resolve(filePath);
        });
      })
      .on("error", async (err) => {
        await fs.unlink(filePath);
        reject(err);
      });
  });
};
