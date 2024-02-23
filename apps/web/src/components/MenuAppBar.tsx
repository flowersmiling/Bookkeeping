/* eslint-disable @typescript-eslint/no-unused-vars */
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import BuildIcon from '@mui/icons-material/Build'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import OtherHousesIcon from '@mui/icons-material/OtherHouses'
import PeopleIcon from '@mui/icons-material/People'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import { Button } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as React from 'react'

import img1 from '../assets/images/unnamed.png'
import { useLogout, useUser } from '../lib/auth'

// import MenuIcon from '@mui/icons-material/Menu'
// import LogoutIcon from '@mui/icons-material/Logout'
const MenuAppBar = () => {
  const [auth, setAuth] = React.useState(true)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const router = useRouter()

  const logout = useLogout()

  const handleChange = () => {
    router.push('/')

    setTimeout(() => {
      logout.mutate({})
    }, 1000)
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  const { data: user, isSuccess } = useUser()

  return (
    // authed user (accounting role code 202)
    <Box>
      {isSuccess && user.role === 202 ? (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Box component="div" sx={{ flexGrow: 1 }}>
                <Link href="/">
                  <Image src={img1} width={220} height={180} alt="homecare" />
                </Link>
              </Box>
              <Box>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircleIcon fontSize="large" />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem>
                    <Typography variant="h5">
                      Welcome, {user.first_name} {user.last_name}
                    </Typography>
                  </MenuItem>
                  <Link href="/auth/account-setting">
                    <MenuItem onClick={handleClose}>
                      <ListItemIcon>
                        <ManageAccountsIcon fontSize="medium" />
                      </ListItemIcon>
                      Account Setting
                    </MenuItem>
                  </Link>
                  <Link href="/admin/user-management">
                    <MenuItem onClick={handleClose}>
                      <ListItemIcon>
                        {' '}
                        <PeopleIcon fontSize="medium" />
                      </ListItemIcon>
                      User Management
                    </MenuItem>
                  </Link>

                  <Link href="/accounting/totalmonthlyreport">
                    <MenuItem onClick={handleClose}>
                      <ListItemIcon>
                        <TextSnippetIcon fontSize="medium" />
                      </ListItemIcon>
                      Admin Monthly Worksheet
                    </MenuItem>
                  </Link>

                  {/* <Link href="/agent/maintenance-management">
                  <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                      <BuildIcon fontSize="small" />
                    </ListItemIcon>
                    Property Maintenance
                  </MenuItem>
                </Link> */}

                  <Link href="/contract/admincontract">
                    <MenuItem onClick={handleClose}>
                      <ListItemIcon>
                        <FileDownloadIcon fontSize="medium" />
                      </ListItemIcon>
                      Contract Management
                    </MenuItem>
                  </Link>
                  <MenuItem onClick={handleClose}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleChange()}
                    >
                      Logout
                    </Button>
                  </MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </AppBar>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Box sx={{ flexGrow: 1 }}>
                <Link href="/">
                  <Image src={img1} width={220} height={140} alt={' '} />
                </Link>
              </Box>
              {isSuccess && (
                <div>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <AccountCircleIcon fontSize="large" />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem>
                      <Typography variant="h5">
                        Welcome, {`${user.first_name} ${user.last_name}`}
                      </Typography>
                    </MenuItem>
                    <Link href="/auth/account-setting">
                      <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                          <ManageAccountsIcon fontSize="medium" />
                        </ListItemIcon>
                        Account Setting
                      </MenuItem>
                    </Link>
                    <Link href="/agent/property-management">
                      <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                          {' '}
                          <OtherHousesIcon fontSize="medium" />
                        </ListItemIcon>
                        Property List
                      </MenuItem>
                    </Link>

                    <Link href="/agent/rent-management">
                      <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                          <TextSnippetIcon fontSize="medium" />
                        </ListItemIcon>
                        Monthly Worksheet
                      </MenuItem>
                    </Link>

                    <Link href="/agent/maintenance-management">
                      <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                          <BuildIcon fontSize="medium" />
                        </ListItemIcon>
                        Property Maintenance
                      </MenuItem>
                    </Link>

                    <Link href="/contract/admincontract">
                      <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                          <FileDownloadIcon fontSize="medium" />
                        </ListItemIcon>
                        Contract Download
                      </MenuItem>
                    </Link>
                    <MenuItem onClick={handleClose}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleChange()}
                      >
                        Logout
                      </Button>
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </Toolbar>
          </AppBar>
        </Box>
      )}
    </Box>
  )
}

export default MenuAppBar
