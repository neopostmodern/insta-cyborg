import { AllImagesData, fetchImageList } from '@insta-cyborg/util'
import { useEffect, useState } from 'react'
import { DataState } from './dataUtil'
import deleteImage from './deleteImage'
import requestNewImage from './requestNewImage'

export type UseAllImages = [
  DataState<AllImagesData>,
  {
    requestNewImage: () => Promise<void>
    deleteImage: (imageId: string) => Promise<void>
  },
]

const useAllImages = (): UseAllImages => {
  const [dataState, setDataState] = useState<DataState<AllImagesData>>({
    loading: true,
  })

  useEffect(() => {
    ;(async () => {
      try {
        const data = await fetchImageList()
        data.posted.reverse()
        data.available.reverse()
        setDataState({ data })
      } catch (error) {
        setDataState({
          error: true,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })()
  }, [])

  const requestNewImageWrapper = async () => {
    if (!('data' in dataState)) {
      throw Error("Can't request new image before image data is loaded.")
    }
    const imageId = await requestNewImage()
    setDataState({
      ...dataState,
      data: {
        ...dataState.data,
        available: [imageId, ...dataState.data.available],
      },
    })
  }
  const deleteImageWrapper = async (imageId: string) => {
    if (!('data' in dataState)) {
      throw Error("Can't request new image before image data is loaded.")
    }
    await deleteImage(imageId)
    setDataState({
      ...dataState,
      data: {
        ...dataState.data,
        available: dataState.data.available.filter((id) => id !== imageId),
      },
    })
  }

  return [
    dataState,
    {
      requestNewImage: requestNewImageWrapper,
      deleteImage: deleteImageWrapper,
    },
  ]
}

export default useAllImages
