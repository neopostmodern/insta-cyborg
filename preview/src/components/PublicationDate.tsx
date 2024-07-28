import { Box } from '@mui/material'
import React from 'react'

export const PublicationDate = ({
  imagePublishAt,
  mobile,
}: {
  imagePublishAt: Date | null
  mobile?: boolean
}) => {
  const dateRepresentation = imagePublishAt
    ? new Date(imagePublishAt).toISOString().split('T')[0]
    : 'Date unknown'
  return (
    <Box padding={mobile ? 1 : 2} color='gray' fontSize='small'>
      {dateRepresentation}
    </Box>
  )
}
