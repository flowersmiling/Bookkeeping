/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-alert */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unused-vars */
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-enterprise'

import Typography from '@mui/material/Typography'
import { ColDef, RowValueChangedEvent } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useMutation } from 'react-query'

import { Alert, Box, Button } from '@mui/material'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import DateEditor from '../../components/Editors/DateEditor'
import MyDatePicker from '../../components/Editors/MyDatePicker'
import NumericCellEditor from '../../components/Editors/NumericCellEditor'
import SimpleEditor from '../../components/Editors/SimpleEditor'
import ActionsRenderer from '../../components/Renderers/ActionsRenderer'
import AddRowStatusBar from '../../components/StatusBar/AddRowStatusBar'
import {
  updateUserRole,
  deleteUser,
  resetPassword
} from '../../services/userService'
import RoleEditor from './RoleEditor'
import RoleRender from './RoleRender'
import RoleStatusEditor from './RoleStatusEditor'
import RoleStatusRender from './RoleStatusRender'
import UpdatePassword from '../../components/Renderers/UpdatePassord'
import { useUser } from '../../lib/auth'

// must load the Property data before defining the Cloumn Definitions for AG-Grid
// otherwise would not be able to create a drop-down-list of Property options
const selectData: { [x: string]: string } = {}

// const { data: user, isSuccess } = useUser()

const UserManagement = () => {
  const [gridApi, setGridApi] = useState(null)
  const [columnApi, setColumnApi] = useState(null)
  const [rowData, setRowData] = useState(null)
  const [alertContext, setAlertContext] = useState(
    'Plese DO NOT DELETE user ! Set the status as "inactive" if the user is no longer active,'
  )
  const lookupKey = (mappings: { [x: string]: any }, name: any) => {
    const keys = Object.keys(mappings)
    for (const i in keys) {
      if (mappings[i] === name) {
        return i
      }
    }
  }

  const { mutate: updateRole } = useMutation({
    mutationFn: (userData: any) => updateUserRole(userData),
    onSuccess: () => {
      toast.success('User Updated')
    },
    onError: () => {
      console.log('error')
    }
  })

  const { mutate: deleteRole } = useMutation({
    mutationFn: (userData: any) => deleteUser(userData),
    onSuccess: () => {
      toast.success('User Deleted')
    },
    onError: () => {
      console.log('error')
    }
  })
  const [ConfirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: ''
  })

  const Columns = [
    { field: '_id', headerName: 'ID', hide: true },
    {
      field: 'first_name',
      headerName: 'First Name'
    },
    {
      field: 'last_name',
      headerName: 'Last Name'
    },
    {
      field: 'email',
      headerName: 'Email'
    },
    {
      field: 'mobile',
      headerName: 'Mobile'
    },
    {
      field: 'address',
      headerName: 'Address'
    },
    {
      field: 'role',
      headerName: 'Role',
      editable: true,
      cellRenderer: RoleRender,
      cellEditor: RoleEditor,
      cellEditorPopup: true
    },
    {
      field: 'status',
      headerName: 'Status',
      editable: true,
      cellRenderer: RoleStatusRender,
      cellEditor: RoleStatusEditor,
      cellEditorPopup: true
    },
    {
      headerName: '',
      colId: 'actions',
      cellRenderer: 'updatePasswordRender',
      editable: false,
      filter: false,
      minWidth: 220
    }
  ]

  const [columnDefs] = useState<ColDef[]>(Columns)
  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: true,
      suppressKeyboardEvent: (params) => params.editing
    }),
    []
  )

  const Components = {
    simpleEditor: SimpleEditor,
    numericCellEditor: NumericCellEditor,
    updatePasswordRender: UpdatePassword,
    dateEditor: DateEditor,
    agDateInput: MyDatePicker
    // addRowStatusBar: AddRowStatusBar
  }

  const onGridReady = (params: any) => {
    setGridApi(params.api)
    setColumnApi(params.columnApi)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
      .then((result) => result.json())
      .then((result) => setRowData(result))
    params.api.sizeColumnsToFit()
  }

  const onRowValueChanged = useCallback(
    (event: RowValueChangedEvent) => {
      const { data } = event
      data.role = Number(data.role)
      data.status = Number(data.status)

      updateRole(data)
    },
    [updateRole]
  )

  const methodFromParent = (cell: string) => {
    const isSure = window.confirm('Are you sure to delete this record?')

    if (isSure === true) {
      deleteRole(cell)
      console.log(cell)
    } else {
      window.location.reload()
    }
  }

  const resetPasswordParent = (cell: string) => {
    if (cell) {
      resetPassword(cell)
    }
  }

  const { data: user, isSuccess } = useUser()

  return (
    <div className="my-app">
      {user?.role === 201 || user?.role === 202 ? (
        <>
          <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
            User Management
          </Typography>
          <Toaster position="top-center" />
          <div
            id="myGrid"
            style={{ height: '100%', width: '100%' }}
            className="ag-theme-alpine"
          >
            <Link href="/auth/register">
              <Button variant="outlined" size="large">
                Add New User
              </Button>
            </Link>
            <Alert variant="filled" severity="warning">
              {alertContext}
            </Alert>
            <AgGridReact
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowData={rowData}
              onGridReady={onGridReady}
              editType="fullRow"
              components={Components}
              onRowValueChanged={onRowValueChanged}
              context={{ methodFromParent, resetPasswordParent }} // Parent/Child Communication using context
              // statusBar={{
              //   statusPanels: [{ statusPanel: 'addRowStatusBar' }]
              // }}
            />
          </div>
        </>
      ) : (
        <h1>Access Denied</h1>
      )}
    </div>
  )
}

export default UserManagement
