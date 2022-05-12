import { createRelativeDirectoryIfNotExists } from "@insta-cyborg/util";

export const STORAGE_PATH_MEDIA = await createRelativeDirectoryIfNotExists(
  new URL(`../media/`, import.meta.url)
);
export const STORAGE_PATH_DATA = await createRelativeDirectoryIfNotExists(
  new URL(`../data/`, import.meta.url)
);
