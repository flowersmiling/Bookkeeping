/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Visibility, VisibilityOff } from '@mui/icons-material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput
} from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import { useLogin, useUser } from '../../lib/auth'

interface LoginData {
  email: string
  password: string
}

interface LoginResponse {
  error?: string
  // any other properties returned by your API
}

const theme = createTheme()

const Login: NextPage = () => {
  const login = useLogin()

  const router = useRouter()
  const { data: user, isSuccess } = useUser()
  const [shownewPassword, setShownewPassword] = React.useState(false)
  const handleClickShownewPassword = () => setShownewPassword((show) => !show)
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  useEffect(() => {
    if (login.isSuccess && user.role === 209) {
      router.push('/agent/rent-management')
    }
    if (login.isSuccess && user.role === 202) {
      router.push('/accounting/totalmonthlyreport')
    }
  }, [login.isSuccess, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget) as any

    const email = data.get('email') as string
    const password = data.get('password') as string

    login.mutate(data)
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <FormControl sx={{ width: '52ch' }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">
                New Password
              </InputLabel>
              <OutlinedInput
                required
                fullWidth
                name="password"
                label="Password"
                id="password"
                autoComplete="current-password"
                type={shownewPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShownewPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {shownewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                // onChange={(e) => setNewPassword(e.target.value)}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              variant="outlined"
            >
              Sign In
            </Button>
            {login.isError && (
              <p className="text-red-600">
                Your password or email address is wrong!
              </p>
            )}
          </Box>
        </Box>
      </Container>
      {/* push to home page if isSuccess is true */}
    </ThemeProvider>
  )
}

export default Login
