/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react'
import { storage } from '../../lib/utils'
import Maintenance from './maintenance'

const MaintenanceManagement = () => {
  const headers = { Authorization: `Bearer ${storage.getToken()}` }
  const baseURL = `${process.env.NEXT_PUBLIC_API_URL}`
  const [selectData, setSelectedData] = useState<{ [x: string]: string }>({})
  const [gotData, setGotData] = useState(false)

  fetch(`${baseURL}/properties/manager/`, { headers })
    .then((result) => result.json())
    .then((result) => {
      result.forEach((item: any) => {
        selectData[item._id] = `[ ${item.landlord} ] :  ${item.fulladdress}`
      })
      setSelectedData(selectData)
      setGotData(true)
    })

  return gotData ? (
    <div>
      <Maintenance selectData={selectData} />
    </div>
  ) : (
    <div>
      <span>Loading...</span>
    </div>
  )
}

export default MaintenanceManagement
