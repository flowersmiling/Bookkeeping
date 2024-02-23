/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-shadow */

/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-alert */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-enterprise'
import { ColDef, RowValueChangedEvent } from 'ag-grid-community'
import dayjs from 'dayjs'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import toast, { Toaster } from 'react-hot-toast'
import Typography from '@mui/material/Typography'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { TextField } from '@mui/material'
import SimpleEditor from '../../components/Editors/SimpleEditor'
import NumericCellEditor from '../../components/Editors/NumericCellEditor'
import ActionsRenderer from '../../components/Renderers/ActionsRenderer'
import DateEditor from '../../components/Editors/DateEditor'
import MyDatePicker from '../../components/Editors/MyDatePicker'
import AddRowStatusBar from '../../components/StatusBar/AddRowStatusBar'
import { storage } from '../../lib/utils'

const headers = { Authorization: `Bearer ${storage.getToken()}` }
const baseURL = `${process.env.NEXT_PUBLIC_API_URL}`
interface select {
  selectData: { [x: string]: string }
}

const Maintenance: React.FC<select> = (props: any) => {
  const { selectData } = props
  const [gridApi, setGridApi] = useState(null)
  const [columnApi, setColumnApi] = useState(null)
  const [selectedDate, setSelectedDate] = useState<any>(new Date())
  const [rowData, setRowData] = useState(null)
  const lookupKey = (mappings: { [x: string]: any }, name: any) => {
    const keys = Object.keys(mappings || {})
    for (const i in keys) {
      if (mappings[i] === name) {
        return i
      }
    }
  }

  function hashValueGetter(params: any) {
    return params.node ? params.node.rowIndex : null
  }

  const Columns = [
    { headerName: '#', maxWidth: 60, valueGetter: hashValueGetter },
    { field: '_id', headerName: 'ID', hide: true },
    {
      field: 'property',
      headerName: 'Property [Landlord]: Address',
      cellEditor: 'agSelectCellEditor',
      editable: true,
      cellEditorParams: {
        useFormatter: true, // display the formatted text rather than the keys
        values: Object.keys(selectData || {})
      },
      filterParams: {
        valueFormatter: (params: any) => selectData[params.value]
      },
      valueFormatter: (params: any) => selectData[params.value], // convert key to value
      valueParser: (params: any) => lookupKey(selectData, params.value) // convert value to key
    },
    {
      field: 'item',
      headerName: 'Item',
      editable: true,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'amount',
      headerName: 'Amount',
      editable: true,
      cellEditor: 'numericCellEditor',
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'maintenance_date',
      headerName: 'Date',
      editable: true,
      cellEditor: 'dateEditor',
      // option one:
      // valueFormatter: (params: any) => {
      //   const dateParts = params.value.slice(0, 10).split('-')
      //   return `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
      // },
      // option two:
      cellRenderer: (params: { value: any }) => {
        if (params.value === undefined) {
          return dayjs().format('YYYY-MM-DD') // set default value for adding new row
        }
        return dayjs(params.value.slice(0, 10)).format('YYYY-MM-DD')
      },
      filter: 'agDateColumnFilter',
      filterParams: {
        clearButton: true,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: any, cellValue: any) => {
          const cellDate = dayjs(cellValue.slice(0, 10)).format('YYYY-MM-DD')
          const filterDate = dayjs(filterLocalDateAtMidnight).format(
            'YYYY-MM-DD'
          )
          if (filterDate === cellDate) {
            return 0
          }
          if (cellDate < filterDate) {
            return -1
          }
          if (cellDate > filterDate) {
            return 1
          }
        }
      }
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

  const [columnDefs] = useState<ColDef[]>(Columns)
  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
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
    numericCellEditor: NumericCellEditor,
    actionsRenderer: ActionsRenderer,
    dateEditor: DateEditor,
    agDateInput: MyDatePicker,
    addRowStatusBar: AddRowStatusBar
  }

  const loadData = (params: Date) => {
    const year = params.getFullYear()
    const month = params.getMonth() + 1

    fetch(`${baseURL}/maintenances/agent/${year}/${month}`, { headers })
      .then((result) => result.json())
      .then((result) => setRowData(result))
  }

  const onGridReady = (params: any) => {
    setGridApi(params.api)
    setColumnApi(params.columnApi)
    loadData(selectedDate)
    params.api.sizeColumnsToFit()
  }

  const onRowValueChanged = useCallback((event: RowValueChangedEvent) => {
    const { data } = event
    const maintenance_date = data.maintenance_date
      ? data.maintenance_date
      : new Date()
    const current = new Date()
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1) // default time is 00:00:00
    const lastDay = new Date(
      current.getFullYear(),
      current.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ) // last monment of the last day
    const utcDate = new Date(maintenance_date)
    const inputDate = new Date(
      utcDate.getFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate()
    )

    // avoid invalid amount
    if (/^[0-9]+(\.[0-9]{1,2})?$/.test(data.amount) === false) {
      toast.error(
        `Amount must be a number with 0-2 decimal places such as: 1234.56`
      )
      return
    }

    // avoid modifying the previous data or add future data
    if (inputDate > lastDay || inputDate < firstDay) {
      toast.error(`CAN NOT modify previous data or add future data`)
      // event.node.setDataValue('maintenance_date', dayjs(current).format('YYYY-MM-DD'))
      return
    }

    if (data._id === undefined) {
      fetch(`${baseURL}/maintenances/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storage.getToken()}`
        },
        body: JSON.stringify({
          property: data.property,
          item: data.item,
          maintenance_date: data.maintenance_date
            ? data.maintenance_date
            : new Date(),
          amount: data.amount
        })
      })
        .then((result) => result.json())
        .then((result) => {
          data._id = result.insertedId // avoid inserting repeatedly
          if (result.insertedId) {
            toast.success(`successfully add a new row`)
          } else {
            toast.error(
              `Failed to add a new row, please check all of the columns have been filled out correctly`
            )
          }
        })
    } else {
      fetch(`${baseURL}/maintenances/${data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storage.getToken()}`
        },
        body: JSON.stringify({
          property: data.property,
          item: data.item,
          maintenance_date: data.maintenance_date
            ? data.maintenance_date
            : new Date(),
          amount: data.amount
        })
      })
        .then((result) => result.json())
        .then((result) => {
          if (result.modifiedCount === 1) {
            toast.success(`successfully update the row`)
          } else {
            toast.error(
              `Failed to update the row, please check all of the entered values are correct`
            )
          }
        })
    }
  }, [])

  const handleDateChange = (params: any) => {
    setSelectedDate(params)
    loadData(params)
  }

  const methodFromParent = (cell: string, date: Date) => {
    const current = new Date()
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1) // default time is 00:00:00
    const lastDay = new Date(
      current.getFullYear(),
      current.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ) // last monment of the last day
    const utcDate = new Date(date)
    const inputDate = new Date(
      utcDate.getFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate()
    )

    // avoid deleting the previous data or add future data
    if (inputDate > lastDay || inputDate < firstDay) {
      toast.error(`CAN NOT delete past data`)
    } else if (cell) {
      fetch(`${baseURL}/maintenances/${cell}`, {
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
  }

  return (
    <div className="my-app">
      <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
        Maintenance Management
      </Typography>
      <Toaster position="top-center" />
      <div className="add-btn-container">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DesktopDatePicker
            views={['year', 'month']}
            minDate={new Date('2023-01-02')}
            maxDate={new Date('2042-12-31')}
            inputFormat="yyyy-MM"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </div>
      <div
        id="myGrid"
        style={{ height: 800, width: '100%' }}
        className="ag-theme-alpine"
      >
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          onGridReady={onGridReady}
          editType="fullRow"
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

export default Maintenance
