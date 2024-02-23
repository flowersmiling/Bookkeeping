/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import FileUploadIcon from '@mui/icons-material/FileUpload'
// import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { storage } from '../../lib/utils'

const baseURL = `${process.env.NEXT_PUBLIC_API_URL}`
const headers = { Authorization: `Bearer ${storage.getToken()}` }

const contractupload = () => {
  const [authen, setAuthen] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        fetch(`${baseURL}/api/users/me`, { headers })
          .then((result) => result.json())
          .then((result) =>
            setAuthen(!(result.role === 201 || result.role === 202))
          )
      } catch (error) {
        console.log(`Failed to fetch user role`)
      }
    }

    getUser()
  }, [])

  const uploadFile = (e: any) => {
    const file = e.target.files![0]
    const formData = new FormData()
    formData.append('file', file)

    // axios.post(`${baseURL}/contracts/upload`, formData, { headers: { Authorization: `Bearer ${storage.getToken()}` } })
    //   .then(res => {
    //     console.log(res.data)
    //   })

    fetch(`${baseURL}/contracts/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${storage.getToken()}`
      }
    })
      .then((result) => result.json())
      .then((result) => {
        if (result.insertedId) {
          toast.success(`successfully add a new file`)
        } else {
          toast.error(
            `Failed to add a new file, please check your file type and size`
          )
        }
      })
  }

  return (
    <div>
      {' '}
      <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
        Admin Contract
      </Typography>
      <Toaster position="top-center" />
      <br />
      <Button
        variant="contained"
        component="label"
        startIcon={<FileUploadIcon />}
        sx={{ m: 2, width: '28ch', height: '6ch' }}
        disabled={authen}
      >
        Upload
        <input
          hidden
          accept="image/*"
          multiple
          type="file"
          onChange={uploadFile}
        />
      </Button>
    </div>
  )
}

export default contractupload
