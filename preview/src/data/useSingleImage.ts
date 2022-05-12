import { CaptionedImage, fetchImageData } from "@insta-cyborg/util";
import { useEffect, useState } from "react";
import { DataState } from "./dataUtil";
import updateImage from "./updateImage";

type UseSingleImage = [
  DataState<CaptionedImage>,
  { updateImage: (imageDiff: Partial<CaptionedImage>) => Promise<void> }
];

const useSingleImage = (imageId: string): UseSingleImage => {
  const [dataState, setDataState] = useState<DataState<CaptionedImage>>({
    loading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchImageData(imageId);
        setDataState({ data });
      } catch (error) {
        setDataState({
          error: true,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();
  }, []);

  const updateImageWrapper = async (imageDiff: Partial<CaptionedImage>) => {
    if (!("data" in dataState)) {
      throw Error("Can't request new image before image data is loaded.");
    }
    const updatedImage = await updateImage(dataState.data.imageId, imageDiff);
    setDataState({
      ...dataState,
      data: updatedImage,
    });
  };

  return [dataState, { updateImage: updateImageWrapper }];
};

export default useSingleImage;
