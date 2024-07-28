/** @jsxImportSource @emotion/react */
import { AUTHORIZATION_MISSING } from '@insta-cyborg/util'
import {
  Computer,
  PhoneAndroid,
  Preview,
  Visibility as VisibilityIcon,
  VisibilityOff,
} from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import useImagesData from '../data/useAllImages'
import { CornerControls, Visibility } from '../util'
import Authorization from './Authorization'
import EditPost from './EditPost'
import Grid from './Grid'
import SinglePost from './SinglePost'
import { Centered } from './util'

function App() {
  const [mobile, setMobile] = useState(false)
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PREVIEW)
  const location = useLocation()
  const [data, { requestNewImage, deleteImage }] = useImagesData()

  if ('error' in data && data.message === AUTHORIZATION_MISSING) {
    return (
      <Centered>
        <Authorization />
      </Centered>
    )
  }

  return (
    <>
      <CornerControls horizontalAlignment='left'>
        <IconButton onClick={() => setMobile(!mobile)}>
          {mobile ? <PhoneAndroid /> : <Computer />}
        </IconButton>
        {location.pathname === '/' &&
          {
            preview: (
              <IconButton onClick={() => setVisibility(Visibility.HIDDEN)}>
                <Preview />
              </IconButton>
            ),
            hidden: (
              <IconButton onClick={() => setVisibility(Visibility.SHOW)}>
                <VisibilityOff />
              </IconButton>
            ),
            show: (
              <IconButton onClick={() => setVisibility(Visibility.PREVIEW)}>
                <VisibilityIcon />
              </IconButton>
            ),
          }[visibility]}
      </CornerControls>

      <Routes>
        <Route
          path='/'
          element={
            <Grid
              mobile={mobile}
              visibility={visibility}
              data={data}
              requestNewImage={requestNewImage}
            />
          }
        />
        <Route
          path='/post/:imageId'
          element={<SinglePost deleteImage={deleteImage} mobile={mobile} />}
        />
        <Route path='/post/:imageId/edit' element={<EditPost />} />
      </Routes>
    </>
  )
}

export default App
