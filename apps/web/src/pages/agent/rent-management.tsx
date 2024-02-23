/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react'
import { storage } from '../../lib/utils'
import Rent from './rent'

const RentManagement = () => {
  const headers = { Authorization: `Bearer ${storage.getToken()}` }
  const baseURL = `${process.env.NEXT_PUBLIC_API_URL}`
  const currentTime = new Date()
  const year = currentTime.getFullYear()
  const month = currentTime.getMonth() + 1
  const [selectData, setSelectedData] = useState<{ [x: string]: string }>({})
  const [maintenanceTotal, setMaintenanceTotal] = useState<{
    [x: string]: number
  }>({})
  const [gotData, setGotData] = useState(false)

  fetch(`${baseURL}/properties/manager/200/${year}/${month}`, { headers })
    .then((result) => result.json())
    .then((result) => {
      result.forEach((item: any) => {
        selectData[item._id] = `[ ${item.landlord} ] :  ${item.fulladdress}`
        maintenanceTotal[item._id] = item.maintenance_total.toFixed(2)
      })
      setSelectedData(selectData)
      setMaintenanceTotal(maintenanceTotal)
      setGotData(true)
    })

  return gotData ? (
    <div>
      <Rent selectData={selectData} maintenanceTotal={maintenanceTotal} />
    </div>
  ) : (
    <div>
      <span>Loading...</span>
    </div>
  )
}

export default RentManagement
