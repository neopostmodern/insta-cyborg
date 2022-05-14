import config from '@insta-cyborg/config'
import { fetchOptionsWithAuth } from '@insta-cyborg/util'
import { Logout } from '@mui/icons-material'
import { CircularProgress, IconButton } from '@mui/material'
import { useCallback, useState } from 'react'

const LogoutButton = () => {
  const [loading, setLoading] = useState(false)

  const handleLogout = useCallback(() => {
    setLoading(true)
    ;(async () => {
      const response = await fetch(
        config.instaCyborgServerOrigin + '/auth/logout',
        fetchOptionsWithAuth({
          method: 'POST',
        }),
      )
      if (!response.ok) {
        alert('Authorization failed: ' + (await response.text()))
        setLoading(false)
        return
      }
      window.location.reload()
    })()
  }, [setLoading])

  if (loading) {
    return <CircularProgress />
  }

  return (
    <IconButton onClick={handleLogout}>
      <Logout />
    </IconButton>
  )
}

export default LogoutButton
