/* eslint-disable no-underscore-dangle */
/* eslint-disable arrow-body-style */
import { Box } from '@mui/material'
import Head from 'next/head'
import React from 'react'
// import Link from 'next/link'
import Login from './auth/login'

import { NextPageWithLayout } from './_app'

const Home: NextPageWithLayout = () => {
  return (
    <Box className=" flex-col items-center justify-center py-2">
      <Head>
        <title>HomeCare</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Login />

      {/* <Link href="/auth/login">
        <b>Login</b>
      </Link> */}
      {/* <Link href="/auth/forget-password">Forget Password</Link>
      <Link href="/auth/account-setting">Account Setting</Link>
      <Link href="/agent/property-management">Property Management</Link>
      <Link href="/agent/rent-management">Rent Management</Link>
      <Link href="/agent/maintenance-management">Maintenance Management</Link>
      <Link href="/accounting/totalmonthlyreport">Admin Monthly Report</Link>
      <Link href="/agent/monthlyreportPDF">Landlord Monthly Billing</Link>
      <Link href="/agent/yearlyreportPDF">Landlord Yearly Billing</Link>
      <Link href="/contract/admincontract">Admin Contract</Link>
      <Link href="/contract/contractupload">Admin Contract Upload</Link> */}
    </Box>
  )
}

export default Home
