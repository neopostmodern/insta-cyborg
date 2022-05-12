import { getImageFileName, ImagePurpose } from "@insta-cyborg/util";
import path from "path";
import { STORAGE_PATH_MEDIA } from "./config";

export const getImageFilePath = (
  { imageId, imageSource }: { imageId: string; imageSource: string },
  purpose: ImagePurpose | null = null,
  extension: string | null = null
) =>
  path.join(
    STORAGE_PATH_MEDIA,
    getImageFileName(
      imageId,
      purpose,
      extension === null
        ? path.extname(imageSource).replace(".", "")
        : extension
    )
  );
