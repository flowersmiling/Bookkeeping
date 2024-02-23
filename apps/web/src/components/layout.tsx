/* eslint-disable react/function-component-definition */
import { Box } from '@mui/material'
import React, { ReactNode } from 'react'
import MenuAppBar from './MenuAppBar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <MenuAppBar />
      <Box sx={{ mt: 4, px: 3 }}>{children}</Box>
    </>
  )
}
