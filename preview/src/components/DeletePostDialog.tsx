import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DeletePostDialog = ({
  deleteImage,
  dialogOpen,
  handleCloseDialog,
}: {
  deleteImage: () => Promise<void>
  dialogOpen: boolean
  handleCloseDialog: () => void
}) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const handleClick = useCallback(() => {
    ;(async () => {
      setLoading(true)
      await deleteImage()
      navigate('/')
    })()
  }, [deleteImage, navigate])

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      {loading ? (
        <DialogContent>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <CircularProgress disableShrink />
          </Box>
        </DialogContent>
      ) : (
        <>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              Are you sure you want to delete this post?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleClick} autoFocus>
              Delete post
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export default DeletePostDialog
