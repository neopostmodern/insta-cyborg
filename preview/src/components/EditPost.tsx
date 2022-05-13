/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { captionForImagePost } from '@insta-cyborg/util'
import { Close, Save as SaveIcon } from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  TextField,
} from '@mui/material'
import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import useSingleImage from '../data/useSingleImage'
import { CornerControls } from '../util'
import { ImageDescription } from './ImageDescription'
import ObjectAutoTable from './ObjectAutoTable'

const EditPost = () => {
  const { imageId } = useParams()
  if (imageId === undefined) {
    throw Error('Bad URL')
  }
  const [imageData, { updateImage }] = useSingleImage(imageId)
  const [currentCaption, setCurrentCaption] = React.useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCaption(event.target.value)
  }
  const handleSave = () => {
    updateImage({ postCaption: currentCaption })
  }

  useEffect(() => {
    if ('data' in imageData) {
      setCurrentCaption(imageData.data.postCaption)
    }
  }, [imageData])

  if ('error' in imageData) {
    return (
      <>
        <b>Error</b>
        <br />
        {imageData.message}
      </>
    )
  }
  if ('loading' in imageData) {
    return <CircularProgress />
  }

  return (
    <>
      <CornerControls horizontalAlignment='right'>
        <Link to={`/post/${imageId}`}>
          <IconButton>
            <Close />
          </IconButton>
        </Link>
      </CornerControls>
      <Fab
        color='primary'
        disabled={currentCaption === imageData.data.postCaption}
        onClick={handleSave}
        css={css`
          position: fixed;
          bottom: 64px;
          right: 64px;
        `}
      >
        <SaveIcon />
      </Fab>
      <div
        css={css`
          height: 100vh;

          display: grid;
          grid-template-columns: 500px 500px;
          gap: 32px;
          flex-direction: column;
          justify-content: center;
          align-content: center;
        `}
      >
        <div>
          <img
            src={`http://localhost:3001/media/${imageId}_post-overlay.jpg`}
            css={css`
              width: 100%;
            `}
          />
        </div>

        <div>
          <Paper sx={{ width: '450px', marginBottom: 1 }}>
            <ImageDescription postCaption={currentCaption} mobile />
          </Paper>
          <Paper sx={{ width: '500px' }}>
            <ImageDescription postCaption={currentCaption} />
          </Paper>
        </div>

        <div>
          <TextField
            label='Post caption'
            multiline
            minRows={3}
            value={currentCaption}
            onChange={handleChange}
            fullWidth
          />
          <Button
            onClick={() =>
              setCurrentCaption(captionForImagePost(imageData.data))
            }
            disabled={currentCaption === captionForImagePost(imageData.data)}
          >
            Reset
          </Button>
        </div>
        <div
          css={css`
            max-height: 400px;
            overflow-y: auto;
          `}
        >
          <ObjectAutoTable
            object={imageData.data}
            blacklist={['postCaption', 'storyText']}
          />
        </div>
      </div>
    </>
  )
}

export default EditPost
