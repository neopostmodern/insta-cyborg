import config from '@insta-cyborg/config'
import { fetchOptionsWithAuth } from '@insta-cyborg/util'
import { ArrowForward, Person } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useCallback, useState } from 'react'

const Authorization = () => {
  const [authorization, setAuthorization] = useState('')
  const handleChange = useCallback(
    (event) => {
      setAuthorization(event.target.value)
    },
    [setAuthorization],
  )
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()
      ;(async () => {
        const response = await fetch(
          config.instaCyborgServerOrigin + '/auth/login',
          fetchOptionsWithAuth({
            method: 'POST',
            headers: { authorization },
          }),
        )
        if (!response.ok) {
          alert('Authorization failed: ' + (await response.text()))
          return
        }
        window.location.reload()
      })()
    },
    [authorization],
  )

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        type='password'
        label='Authorization'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton type='submit'>
                {authorization ? <ArrowForward /> : <Person />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        value={authorization}
        onChange={handleChange}
      />
    </form>
  )
}

export default Authorization
