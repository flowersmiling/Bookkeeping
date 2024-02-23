import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
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
import React, { useState } from 'react'
import { useMutation } from 'react-query'
import toast, { Toaster } from 'react-hot-toast'
import { registerUser } from '../../services/userService'

const theme = createTheme()

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  mobile: string
  address: string
}

interface RegisterResponse {
  error?: string

  // any other properties returned by your API
}

const Register: NextPage = () => {
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    mobile: '',
    address: ''
  })

  const router = useRouter()

  const { mutate: register, isSuccess } = useMutation<
    RegisterResponse,
    RegisterData,
    RegisterData,
    RegisterData
  >({
    mutationFn: (userData) => registerUser(userData),
    onSuccess: () => {
      toast.success('successfully added a new user!')
      router.push('/admin/user-management')
    },
    onError: () => {
      console.log('error')
      toast.error('Failed to add a new user,user email already exists')
    }
  })

  const handleSubmit = () => {
    register(formState)
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Toaster position="top-center" />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddAltIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Add New User
          </Typography>
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="fisrt-name"
                  name="first_name"
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  autoFocus
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      first_name: e.target.value
                    })
                  }
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
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      last_name: e.target.value
                    })
                  }
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
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      email: e.target.value
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      password: e.target.value
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="mobile"
                  label="Mobile"
                  id="mobile"
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      mobile: e.target.value
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  id="address"
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      address: e.target.value
                    })
                  }
                />
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                {/* <Link href="/login">
                  Already have an account?{' '}
                  <Typography variant="body2" color="#3A85AB">
                    Sign in!
                  </Typography>
                </Link> */}
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
      {isSuccess && <div>Success</div>}
    </ThemeProvider>
  )
}

export default Register
