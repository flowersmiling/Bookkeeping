/* eslint-disable no-underscore-dangle */
import * as React from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { Link, Button, Typography } from '@mui/material'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { useEffect, useState } from 'react'
import download from 'downloadjs'
import toast, { Toaster } from 'react-hot-toast'
import { storage } from '../../lib/utils'

const headers = { Authorization: `Bearer ${storage.getToken()}` }
const baseURL = `${process.env.NEXT_PUBLIC_API_URL}`

interface Column {
  id: string
  label?: string
  minWidth?: number
  align?: 'left' | 'right'
}

const columns: readonly Column[] = [
  { id: 'filename', label: 'Name', minWidth: 170 },
  { id: 'mimetype', label: 'Type', minWidth: 100 },
  { id: 'size', label: 'Size(Bytes)', minWidth: 100 },
  { id: 'upload_date', label: 'Upload Date', minWidth: 100 }
]

const AdminContract = () => {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [filesList, setFilesList] = useState([])
  const [authen, setAuthen] = useState(true)

  const getFiles = async () => {
    try {
      fetch(`${baseURL}/contracts/files`, { headers })
        .then((result) => result.json())
        .then((result) => setFilesList(result))
    } catch (error) {
      console.log(`failed to fetch files list`)
    }
  }

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

  useEffect(() => {
    getFiles()
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
          getFiles()
        } else {
          toast.error(
            `Failed to add a new file, please check your file type and size`
          )
        }
      })
  }

  const downloadFile = async (
    id: any,
    path: string,
    mimetype: string | undefined
  ) => {
    // response's body (json, text, blob, etc.), setting the responseType to blob.
    // This is very important otherwise you will not get the file in the correct format.
    try {
      fetch(`${baseURL}/contracts/download/${id}`, { headers })
        .then((result) => result.blob())
        .then((result) => {
          const split = path.split('/')
          const filename = split[split.length - 1]
          return download(result, filename, mimetype)
        })
    } catch (error) {
      console.log('Error while downloading file. Try again later')
    }
  }

  const deleteFile = async (id: any) => {
    try {
      fetch(`${baseURL}/contracts/delete/${id}`, {
        method: 'DELETE',
        headers
      })
        .then((result) => result.json())
        .then((result) => {
          if (result.deletedCount === 1) {
            const newList = filesList.filter((item: any) => item._id !== id)
            setFilesList(newList)
            toast.success(`successfully delete a file`)
          }
        })
    } catch (error) {
      console.log('Error while deleting file. Try again later')
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  return (
    <>
      <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
        Admin Contract
      </Typography>
      <Toaster position="top-center" />
      <Button
        variant="contained"
        component="label"
        startIcon={<FileUploadIcon />}
        sx={{ m: 2 }}
        style={{ display: authen ? 'none' : undefined }}
      >
        Admin Contract Upload
        <input
          hidden
          accept="image/*"
          multiple
          type="file"
          onChange={uploadFile}
        />
      </Button>

      <Paper sx={{ m: 3, width: '98%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 850 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filesList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: any) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                    {columns.map((column) => (
                      <TableCell>
                        {column.label === 'Name' ? (
                          <Link
                            href="#/"
                            onClick={() =>
                              downloadFile(row._id, row.filepath, row.mimetype)
                            }
                          >
                            {row[column.id]}
                          </Link>
                        ) : (
                          row[column.id]
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        style={{ display: authen ? 'none' : undefined }}
                        onClick={() => deleteFile(row._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filesList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}

export default AdminContract
