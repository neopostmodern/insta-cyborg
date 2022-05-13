/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Stack } from '@mui/material'
import React from 'react'
import { useLocation } from 'react-router-dom'

export enum Visibility {
  PREVIEW = 'preview',
  HIDDEN = 'hidden',
  SHOW = 'show',
}

export const CornerControls = ({
  horizontalAlignment,
  children,
}: React.PropsWithChildren<{ horizontalAlignment: 'right' | 'left' }>) => {
  const location = useLocation()
  return (
    <Stack
      spacing={2}
      css={css`
        position: fixed;
        top: 28px;
        ${horizontalAlignment}: 28px;
        z-index: 10;
        ${location.pathname.startsWith('/post') &&
        !location.pathname.endsWith('/edit') &&
        css`
          svg {
            fill: white;
          }
        `}
      `}
    >
      {children}
    </Stack>
  )
}
