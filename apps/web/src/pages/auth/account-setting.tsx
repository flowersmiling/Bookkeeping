/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
import SettingsIcon from '@mui/icons-material/Settings'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Grid from '@mui/material/Grid'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import React, { useEffect, useState } from 'react'
import { useMutation } from 'react-query'
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { updateUser } from '../../services/userService'
import { useUser } from '../../lib/auth'

const theme = createTheme()

interface AccountSettingData {
  _id: string
  email: string
  old_password: string
  new_password: string
  first_name: string
  last_name: string
  mobile: string
  address: string
}

interface AccountSettingResponse {
  error?: string

  // any other properties returned by your API
}

const AccountSetting: NextPage = () => {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [showoldPassword, setShowoldPassword] = React.useState(false)
  const handleClickShowoldPassword = () => setShowoldPassword((show) => !show)
  const [shownewPassword, setShownewPassword] = React.useState(false)
  const handleClickShownewPassword = () => setShownewPassword((show) => !show)

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  const { data: user, isSuccess: userLoaded, isError } = useUser()

  useEffect(() => {
    if (isError) {
      router.push('/auth/login')
    }
    if (userLoaded) {
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setEmail(user.email)
      setMobile(user.mobile as any)
      setAddress(user.address as any)
    }
  }, [user, router, isError, userLoaded])

  const { mutate: update, isSuccess } = useMutation<
    AccountSettingResponse,
    AccountSettingData,
    AccountSettingData,
    AccountSettingData
  >({
    mutationFn: (userData) => updateUser(userData),
    onSuccess: () => {
      toast.success(`successfully updated!`)
      router.push('/agent/rent-management')
    },
    onError: () => {
      toast.error(
        `Fail to update,current password is wrong or required sections are not filled in!`
      )
    }
  })

  const handleSubmit = () => {
    update({
      _id: user?._id as any,
      first_name: firstName,
      last_name: lastName,
      email: email,
      old_password: oldPassword,
      new_password: newPassword,
      mobile: mobile,
      address: address
    })
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
            <SettingsIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Settings
          </Typography>
          <Toaster position="top-center" />
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="first-name"
                  name="first_name"
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  value={firstName}
                  autoFocus
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  autoComplete="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl sx={{ width: '52ch' }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">
                    Current Password
                  </InputLabel>
                  <OutlinedInput
                    required
                    fullWidth
                    name="old_password"
                    label="Old Password"
                    id="old_password"
                    type={showoldPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowoldPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showoldPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl sx={{ width: '52ch' }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">
                    New Password
                  </InputLabel>
                  <OutlinedInput
                    required
                    fullWidth
                    name="new_password"
                    label="New Password"
                    id="new_password"
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
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="mobile"
                  label="Mobile"
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSubmit}
            >
              Update
            </Button>
          </Box>
        </Box>
      </Container>
      {isSuccess && <div>Success</div>}
    </ThemeProvider>
  )
}

export default AccountSetting
