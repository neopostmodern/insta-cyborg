/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import config from '@insta-cyborg/config'
import { MoreHoriz as MenuIcon } from '@mui/icons-material'
import { Avatar, Box, IconButton, Menu } from '@mui/material'
import React from 'react'

export const UserSays = ({
  mobile,
  children,
}: React.PropsWithChildren<{ mobile?: boolean }>) => (
  <Box
    sx={mobile ? { padding: 1 } : { marginLeft: 2 }}
    css={css`
      font-size: 14px;
    `}
  >
    <b>{config.instagramUsername}</b> {children}
  </Box>
)

const UserLine = ({
  multiLine,
  actions,
  children,
}: React.PropsWithChildren<{
  multiLine?: boolean
  actions?: JSX.Element | Array<JSX.Element>
}>) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box
      padding={2}
      display='flex'
      alignItems={multiLine ? undefined : 'center'}
    >
      <Avatar
        css={css`
          width: 32px;
          height: 32px;
        `}
      />
      <Box
        sx={{ marginLeft: 2 }}
        css={css`
          font-size: 14px;
        `}
      >
        <b>{config.instagramUsername}</b> {children}
      </Box>
      {actions && (
        <>
          <IconButton
            sx={{ marginLeft: 'auto' }}
            aria-label='more'
            id='post-button'
            aria-controls={open ? 'post-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup='true'
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id='post-menu'
            MenuListProps={{
              'aria-labelledby': 'post-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            {actions}
          </Menu>
        </>
      )}
    </Box>
  )
}

export default UserLine
