/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { getImageUrl, ImagePurpose } from '@insta-cyborg/util'
import { Close, Delete, Edit } from '@mui/icons-material'
import {
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
} from '@mui/material'
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useSingleImage from '../data/useSingleImage'
import { CornerControls } from '../util'
import DeletePostDialog from './DeletePostDialog'
import { ImageDescription } from './ImageDescription'
import UserLine from './UserLine'
import { PublicationDate } from './PublicationDate'

const SinglePost = ({
  deleteImage,
  mobile,
}: {
  deleteImage: (imageId: string) => Promise<void>
  mobile?: boolean
}) => {
  const { imageId } = useParams()
  if (imageId === undefined) {
    throw Error('Bad URL')
  }
  const [imageData] = useSingleImage(imageId)
  const navigate = useNavigate()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const handleClickDeleteNote = React.useCallback(
    () => setDialogOpen(true),
    [setDialogOpen],
  )
  const handleCloseDialog = React.useCallback(() => {
    setDialogOpen(false)
  }, [setDialogOpen])
  const handleDeleteImage = React.useCallback(
    () => deleteImage(imageId),
    [deleteImage, imageId],
  )

  let postCaption
  if ('error' in imageData) {
    postCaption = (
      <>
        <b>Error</b>
        <br />
        {imageData.message}
      </>
    )
  } else if ('loading' in imageData) {
    postCaption = <CircularProgress />
  } else {
    postCaption = (
      <ImageDescription
        postCaption={imageData.data.postCaption}
        mobile={mobile}
      />
    )
  }

  return (
    <>
      <CornerControls horizontalAlignment='right'>
        <Link to='/'>
          <IconButton>
            <Close />
          </IconButton>
        </Link>
      </CornerControls>
      <DeletePostDialog
        deleteImage={handleDeleteImage}
        dialogOpen={dialogOpen}
        handleCloseDialog={handleCloseDialog}
      />
      <div
        css={css`
          background-color: #575757;
          height: 100vh;

          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <Paper
          css={css`
            height: 80vh;
            max-width: 80vw;
            width: calc(80vh + 500px);
            display: flex;
          `}
        >
          <div
            css={css`
              background-color: black;
              aspect-ratio: 1/1;

              display: flex;
              align-items: center;
            `}
          >
            <img
              src={getImageUrl(imageId, ImagePurpose.POST_WITH_OVERLAY)}
              css={css`
                width: 100%;
              `}
            />
          </div>
          <div
            css={css`
              width: 500px;
              flex-shrink: 0;
            `}
          >
            <UserLine
              actions={[
                <MenuItem
                  key='edit'
                  onClick={() => navigate(`/post/${imageId}/edit`)}
                >
                  <ListItemIcon>
                    <Edit />
                  </ListItemIcon>
                  <ListItemText>Edit description</ListItemText>
                </MenuItem>,
                <MenuItem key='delete' onClick={handleClickDeleteNote}>
                  <ListItemIcon>
                    <Delete />
                  </ListItemIcon>
                  <ListItemText>Delete post</ListItemText>
                </MenuItem>,
              ]}
            >
              <b>&bull; Following</b>
            </UserLine>
            <hr
              css={css`
                margin: 0;
                border: none;
                background-color: #efefef;
                height: 1px;
              `}
            />
            {postCaption}
            {'data' in imageData && (
              <PublicationDate
                imagePublishAt={imageData.data.publishAt}
                mobile={mobile}
              />
            )}
          </div>
        </Paper>
      </div>
    </>
  )
}

export default SinglePost
