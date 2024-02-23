/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-enterprise'

import Typography from '@mui/material/Typography'
import { ColDef, RowValueChangedEvent } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import React, { useCallback, useMemo, useState } from 'react'

import { Alert } from '@mui/material'
import toast, { Toaster } from 'react-hot-toast'
import AccountEditor from '../../components/Editors/AccountEditor'
import PostcodeEditor from '../../components/Editors/PostcodeEditor'
import SimpleEditor from '../../components/Editors/SimpleEditor'
import ActionsRenderer from '../../components/Renderers/ActionsRenderer'
import AddRowStatusBar from '../../components/StatusBar/AddRowStatusBar'
import { storage } from '../../lib/utils'

const baseURL = process.env.NEXT_PUBLIC_API_URL

const PropertyManagement = () => {
  const headers = { Authorization: `Bearer ${storage.getToken()}` }
  const [gridApi, setGridApi] = useState(null)
  const [columnApi, setColumnApi] = useState(null)
  const [rowData, setRowData] = useState(null)
  const [alertContext, setAlertContext] = useState(
    'Please DO NOT DELETE property! Set the status as "inactive" if the property is no longer rented out !'
  )
  const status = (params: { value: number }) => {
    switch (params.value) {
      case 99:
        return 'Active'
      case 100:
        return 'Inactive'
      case 101:
        return 'Isolate'
      default:
        return ''
    }
  }
  const statusValue = (params: any) => {
    switch (params.value) {
      case 'Active':
        return 99
      case 'Inactive':
        return 100
      case 'Isolate':
        return 101
      default:
        return 99
    }
  }
  const statusFilter = (params: { value: string }) => {
    switch (params.value) {
      case '99':
        return 'Active'
      case '100':
        return 'Inactive'
      case '101':
        return 'Isolate'
      default:
        return ''
    }
  }

  function hashValueGetter(params: any) {
    return params.node ? params.node.rowIndex : null
  }

  const columns = [
    { headerName: '#', minWidth: 60, valueGetter: hashValueGetter },
    { field: '_id', headerName: 'ID', hide: true },
    { field: 'landlord', headerName: 'Landlord', editable: true },
    { field: 'email', headerName: 'Email', minWidth: 200, editable: true },
    {
      // Account Number(4 sectors): (3|5|9)-(2|3|5|7)-(0|2-11)-(0|2-5|7|10)
      field: 'account',
      headerName: 'Account',
      minWidth: 200,
      cellEditor: 'accountEditor',
      editable: true
    },
    { field: 'address_line2', headerName: 'Deposit', editable: true },
    { field: 'manager', headerName: 'Manager', hide: true },
    {
      field: 'status',
      headerName: 'Status',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        useFormatter: true, // display the formatted text rather than the code
        values: [99, 100, 101]
      },
      filterParams: {
        valueFormatter: statusFilter // string type
      },
      valueFormatter: status, // convert code to value
      valueParser: statusValue // convert value to code
    },
    {
      field: 'address_line1',
      headerName: 'Address',
      minWidth: 300,
      editable: true
    },
    { field: 'city', headerName: 'City', editable: true },
    { field: 'province', headerName: 'Province', editable: true },
    {
      field: 'postcode',
      headerName: 'Postcode',
      editable: true,
      cellEditor: 'postcodeEditor'
    },
    {
      headerName: '',
      colId: 'actions',
      cellRenderer: 'actionsRenderer',
      editable: false,
      filter: false,
      minWidth: 220
    }
  ]

  const [columnDefs] = useState<ColDef[]>(columns)
  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: 150,
      editable: true,
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
    accountEditor: AccountEditor,
    postcodeEditor: PostcodeEditor,
    actionsRenderer: ActionsRenderer,
    addRowStatusBar: AddRowStatusBar
  }

  const onGridReady = (params: any) => {
    setGridApi(params.api)
    setColumnApi(params.columnApi)

    fetch(`${baseURL}/properties/manager/`, { headers })
      .then((result) => result.json())
      .then((result) => setRowData(result))

    params.api.sizeColumnsToFit()
  }

  const onRowValueChanged = useCallback((event: RowValueChangedEvent) => {
    const { data } = event

    if (data._id === undefined) {
      fetch(`${baseURL}/properties/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storage.getToken()}`
        },
        body: JSON.stringify({
          landlord: data.landlord,
          email: data.email ? data.email : '', // avoid inserting null into database
          account: data.account,
          status: data.status,
          address_line1: data.address_line1,
          address_line2: data.address_line2 ? data.address_line2 : '', // avoid inserting null into database
          city: data.city ? data.city : 'Calgary',
          province: data.province ? data.province : 'AB',
          postcode: data.postcode ? data.postcode : ''
        })
      })
        .then((result) => result.json())
        .then((result) => {
          data._id = result.insertedId // avoid inserting repeatedly
          if (result.insertedId) {
            toast.success('Successfully add a new row!')
          } else {
            toast.error(
              'Failed to add a new row, please check if each column has been added correctly.'
            )
          }
        })
    } else {
      fetch(`${baseURL}/properties/${data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storage.getToken()}`
        },
        body: JSON.stringify({
          landlord: data.landlord,
          email: data.email ? data.email : '', // avoid inserting null into database
          account: data.account,
          status: data.status,
          address_line1: data.address_line1,
          address_line2: data.address_line2 ? data.address_line2 : '', // avoid inserting null into database
          city: data.city ? data.city : 'Calgary',
          province: data.province ? data.province : 'AB',
          postcode: data.postcode ? data.postcode : ''
        })
      })
        .then((result) => result.json())
        .then((result) => {
          if (result.modifiedCount === 1) {
            toast.success('Successfully updated the row!')
          } else {
            toast.error(
              `Failed to update the row, please check all of the entered values are correct`
            )
          }
        })
    }
  }, [])

  const methodFromParent = (cell: string) => {
    const isSure = window.confirm(
      'ARE YOU SURE to delete this record? It cannot be restored!'
    )

    if (isSure === true) {
      if (cell) {
        fetch(`${baseURL}/properties/${cell}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storage.getToken()}`
          }
        })
          .then((result) => result.text())
          .then((result) => {
            toast.success(`${result.toString()}`)
          })
      }
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="my-app">
      <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
        Property Management
      </Typography>
      <div
        id="myGrid"
        style={{ height: '100%', width: '100%' }}
        className="ag-theme-alpine"
      >
        <Alert variant="filled" severity="warning">
          {alertContext}
        </Alert>
        <Toaster position="top-center" />
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          onGridReady={onGridReady}
          editType="fullRow"
          // suppressClickEdit // neither Single-Click or Double-Click starts editing
          components={Components}
          onRowValueChanged={onRowValueChanged}
          context={{ methodFromParent }} // Parent/Child Communication using context
          statusBar={{
            statusPanels: [{ statusPanel: 'addRowStatusBar' }]
          }}
        />
      </div>
    </div>
  )
}

export default PropertyManagement
