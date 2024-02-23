import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'

const LandlordBilling: NextPage = () => {
  const router = useRouter()

  const { id } = router.query

  return (
    <div>
      <div>Landlord id: {id}</div>
      <h1> LandlordBilling</h1>
    </div>
  )
}
export default LandlordBilling
