/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-alert */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-enterprise'

import { Alert, Box, Button, TextField } from '@mui/material'
import Typography from '@mui/material/Typography'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import {
  ColDef,
  IAggFuncParams,
  RowValueChangedEvent,
  ValueParserParams
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { isUuid, uuid } from 'uuidv4'
import toast, { Toaster } from 'react-hot-toast'
import DateEditor from '../../components/Editors/DateEditor'
import MyDatePicker from '../../components/Editors/MyDatePicker'
import NumericCellEditor from '../../components/Editors/NumericCellEditor'
import SimpleEditor from '../../components/Editors/SimpleEditor'
import ReportRenderer from '../../components/Renderers/ReportRenderer'
import AddRowStatusBar from '../../components/StatusBar/AddRowStatusBar'
import { storage } from '../../lib/utils'

const headers = { Authorization: `Bearer ${storage.getToken()}` }
const baseURL = `${process.env.NEXT_PUBLIC_API_URL}`

interface select {
  selectData: { [x: string]: string }
  maintenanceTotal: { [x: string]: number }
}

// must set as a global variable, can't be included in RentManagement
let rowImmutableStore: any[]
const rowOperatedStore: any[] = []

const Rent: React.FC<select> = (props: any) => {
  const { selectData, maintenanceTotal } = props
  const gridRef = useRef<AgGridReact>(null)
  const [gridApi, setGridApi] = useState(null)
  const [columnApi, setColumnApi] = useState(null)
  const [rowData, setRowData] = useState<any[]>([])
  const [rowOperated, setRowOperated] = useState(Array<any>)
  const [selectedDate, setSelectedDate] = useState<any>(new Date())
  const [buttonState, setButtonState] = useState(false)
  const [btnSubmitState, setBtnSubmitState] = useState(false)
  const [alertContext, setAlertContext] = useState(
    'Double click the row to edit data'
  )
  const [severity, setSeverity] = useState<any>('info')
  const router = useRouter()

  const lookupKey = (mappings: { [x: string]: any }, name: any) => {
    const keys = Object.keys(mappings)
    for (const i in keys) {
      if (mappings[i] === name) {
        return i
      }
    }
  }

  const loadDictData = (year: any, month: any) => {
    fetch(`${baseURL}/properties/manager/200/${year}/${month}`, { headers })
      .then((result) => result.json())
      .then((result) => {
        result.forEach((item: any) => {
          selectData[item._id] = `[ ${item.landlord} ] :  ${item.fulladdress}`
          maintenanceTotal[item._id] = item.maintenance_total.toFixed(2)
        })
      })
  }

  // Javascript doesn't always represent decimal numbers correctly (e.g 0.2 + 0.1 = 0.30000000000000004).
  function sumFunction(params: IAggFuncParams) {
    let result = 0
    params.values.forEach((value) => {
      if (typeof value === 'number') {
        result += value
      }
    })
    return Number(result.toFixed(2))
  }

  function hashValueGetter(params: any) {
    return params.node ? params.node.rowIndex : null
  }

  const columns = [
    { headerName: '#', minWidth: 60, valueGetter: hashValueGetter },
    { field: '_id', headerName: 'ID', hide: true },
    {
      field: 'property',
      headerName: 'Property [Landlord]: Address',
      cellEditor: 'agSelectCellEditor',
      minWidth: 320,
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
      field: 'prop_address',
      headerName: 'Property Address',
      editable: false,
      width: 300,
      hide: true,
      suppressColumnsToolPanel: true
    },
    {
      field: 'rent_date',
      headerName: 'Rent_date',
      editable: true,
      minWidth: 220,
      cellEditor: 'dateEditor',
      cellRenderer: (params: any) => {
        if (params.value === undefined) {
          if (params.node.footer) {
            // don't disply on the AG-Grid Footer
            return null
          }
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
      field: 'property_docs.landlord',
      headerName: 'Landlord',
      editable: false,
      cellStyle: (params: any) => {
        if (!params.node.footer) {
          return { background: '#cdcdcd' }
        }
      },
      cellRenderer: (params: any) => {
        if (params.node.footer) {
          // display TOTAL on the Footer row
          return 'TOTAL'
        }
        return params.value
      }
    },
    {
      headerName: 'Due to Agent($)',
      editable: false,
      filter: false,
      minWidth: 170,
      cellStyle: (params: any) => {
        if (!params.node.footer) {
          return { background: '#c2f5c0' }
        }
      },
      aggFunc: sumFunction,
      valueGetter: (params: any) => {
        const maintenance: number = Number(params.getValue('maintenance'))
        const agent_amount: number = Number(params.getValue('agent_amount'))
        const earnings: number = agent_amount + maintenance

        return Number(earnings.toFixed(2))
      }
    },

    {
      field: 'agent_fullname',
      headerName: 'Agent',
      editable: false,
      hide: true,
      // rowGroup: true,
      enableRowGroup: true
    },
    {
      field: 'tenant',
      headerName: 'Tenant',
      editable: true
    },
    {
      field: 'tenant_amount',
      headerName: 'Tenant($)',
      editable: true,
      // editing works with strings, need to change string to number
      valueParser: (params: ValueParserParams) => Number(params.newValue),
      aggFunc: sumFunction
    },
    {
      field: 'landlord_amount',
      headerName: 'Landlord($)',
      editable: false,
      cellStyle: (params: any) => {
        if (!params.node.footer) {
          return { background: '#cdcdcd' }
        }
      },
      valueGetter: (params: any) => {
        // can't get the value of this column????
        const tenant: number = Number(params.getValue('tenant_amount'))
        const agent: number = Number(params.getValue('agent_amount'))
        const maintenance: number = Number(params.getValue('maintenance'))
        const company: number = Number(params.getValue('company_amount'))
        const cra: number = Number(params.getValue('cra'))
        const landlord: number = tenant - agent - maintenance - company - cra

        if (params.data.landlord_amount !== landlord) {
          const temp: number = Number(params.data.landlord_amount)
          return Number(temp.toFixed(2))
        }
        return Number(landlord.toFixed(2)) // must return Number type for column aggregate
      },
      aggFunc: sumFunction
      // cellStyle: (params: any) => {
      //   if (params.value === ' ') {
      //     // space,not empty
      //     return { backgroundColor: '#f44336' }
      //   }
      //   return { backgroundColor: '' }
      // }
    },
    {
      field: 'agent_amount',
      headerName: 'Agent($)',
      editable: true,
      valueParser: (params: ValueParserParams) => Number(params.newValue)
      // aggFunc: sumFunction  // Auto calculated value can't be aggregated correctly
      // aggFunc: 'sum'   // Javascript doesn't always represent decimal numbers correctly (e.g 0.2 + 0.1 = 0.30000000000000004).
    },
    {
      field: 'maintenance',
      headerName: 'Maintenance($)',
      editable: false,
      minWidth: 150,
      cellStyle: (params: any) => {
        if (!params.node.footer) {
          return { background: '#cdcdcd' }
        }
      },
      valueGetter: (params: any) => {
        const id = params.getValue('property')
        if (Number(params.data.maintenance) !== Number(maintenanceTotal[id])) {
          return Number(params.data.maintenance)
        }
        return Number(maintenanceTotal[id]) // must return Number type for column aggregate
      },
      aggFunc: sumFunction
    },
    {
      field: 'company_amount',
      headerName: 'Company($)',
      editable: true,
      valueParser: (params: ValueParserParams) => Number(params.newValue),
      aggFunc: sumFunction
    },
    {
      field: 'cra',
      headerName: 'CRA($)',
      editable: true,
      valueParser: (params: ValueParserParams) => Number(params.newValue),
      aggFunc: sumFunction
    },
    {
      field: 'property_docs.account',
      headerName: 'Landlord Account',
      minWidth: 210,
      editable: false,
      cellStyle: (params: any) => {
        if (!params.node.footer) {
          return { background: '#cdcdcd' }
        }
      }
    },
    {
      field: 'rental_start',
      headerName: 'Rental_start',
      editable: true,
      minWidth: 220,
      cellEditor: 'dateEditor',
      cellRenderer: (params: any) => {
        if (params.value === undefined) {
          if (params.node.footer) {
            // don't disply on the AG-Grid Footer
            return null
          }
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
      field: 'rental_end',
      headerName: 'Rental_end',
      editable: true,
      minWidth: 220,
      cellEditor: 'dateEditor',
      cellRenderer: (params: any) => {
        if (params.value === undefined) {
          if (params.node.footer) {
            // don't disply on the AG-Grid Footer
            return null
          }
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

    // { field: 'grant', headerName: 'Grant', hide: true },
    { field: 'note', headerName: 'Note', editable: true, minWidth: 220 },
    {
      headerName: 'Report',
      editable: false,
      filter: false,
      cellRenderer: 'reportRenderer',
      minWidth: 220
    }
  ]
  // @ts-ignore: Object is possibly 'null'.
  const getBoolean = (id: any) => !!document.querySelector('#' + id).checked

  const getParams = () => ({
    allColumns: getBoolean('allColumns')
  })

  const onBtExport = useCallback(() => {
    // @ts-ignore: Object is possibly 'null'.
    gridRef.current.api.exportDataAsExcel(getParams())
  }, [])

  const [columnDefs] = useState<ColDef[]>(columns)
  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: 140,
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
    dateEditor: DateEditor,
    agDateInput: MyDatePicker,
    reportRenderer: ReportRenderer,
    addRowStatusBar: AddRowStatusBar
  }

  const loadData = (params: Date) => {
    const year = params.getFullYear()
    const month = params.getMonth() + 1

    loadDictData(year, month) // load dictionary data for summarizing maintenance_amount automatically

    fetch(`${baseURL}/rents/agent/${year}/${month}`, { headers })
      .then((result) => result.json())
      .then((result: any[]) => {
        // result.forEach((item, index) => (item.id = index))
        rowImmutableStore = result
        setRowData(rowImmutableStore)
      })

    setSeverity('info')
    setAlertContext(`Double click the row to edit data`)
  }

  const onGridReady = (params: any) => {
    setGridApi(params.api)
    setColumnApi(params.columnApi)
    loadData(selectedDate)
  }

  const setAlertMessages = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const tenthDay = new Date(now.getFullYear(), now.getMonth(), 10)

    if (now >= firstDay && now <= tenthDay) {
      setSeverity('warning')
      setAlertContext(`Data changes not submitted`)
    }
  }

  const onRowEditingStopped = () => {
    // Function: solve when you have just one row, you can't stop edit state for it
    gridRef.current?.api.stopEditing()
  }

  // const validateInput = (params: any) => {
  //   const landlord_earnings =
  //     params.tenant_amount -
  //     params.maintenance -
  //     params.cra -
  //     params.agent_amount -
  //     params.company_amount

  //   // Javascript's numeric types are stored in 64-bit IEEE 754 format
  //   if (
  //     Number(params.landlord_amount) === Number(landlord_earnings.toFixed(2))
  //   ) {
  //     return true
  //   }
  //   return false
  // }

  // // cooperate with AG-Grid property editType="fullrow"
  // const onRowValueChanged = useCallback((event: RowValueChangedEvent) => {
  //   const { data } = event

  //   // validation
  //   if (validateInput(data)) {
  //     setSeverity('success')
  //     setAlertContext(`Calculating correct`)
  //   } else {
  //     event.node.setDataValue('landlord_amount', ' ') // launch cell to change cellStyle through modifying the cell value
  //     setSeverity('warning')
  //     setAlertContext(`Calculating error, please double check`)
  //     return
  //   }

  //   const dupIndex = rowOperatedStore.findIndex((item) => item._id === data._id)
  //   // avoid duplicated add row or update row
  //   if (dupIndex === -1) {
  //     if (isUuid(data._id)) {
  //       const newRow = { _id: data._id, action: 'create' }
  //       rowOperatedStore.push(newRow)
  //       setRowOperated(rowOperatedStore)
  //     } else if (data._id === undefined) {
  //       // back-end auto generates data or previous month data from database
  //       data._id = uuid()
  //       const newRow = { _id: data._id, action: 'create' }
  //       rowOperatedStore.push(newRow)
  //       setRowOperated(rowOperatedStore)
  //     } else {
  //       const newRow = { _id: data._id, action: 'update' }
  //       rowOperatedStore.push(newRow)
  //       setRowOperated(rowOperatedStore)
  //     }

  //     setAlertMessages()
  //   }
  // }, [])

  const onCellValueChanged = (params: any) => {
    const { data } = params
    const colId = params.column.getId()
    const tenant_amount = data.tenant_amount ? data.tenant_amount : 0
    const agent_amount = data.agent_amount ? data.agent_amount : 0
    const maintenance = data.maintenance ? data.maintenance : 0
    const company_amount = data.company_amount ? data.company_amount : 0
    const cra = data.cra ? data.cra : 0

    const dupIndex = rowOperatedStore.findIndex((item) => item._id === data._id)
    // avoid duplicated add row or update row
    if (dupIndex === -1) {
      if (isUuid(data._id)) {
        const newRow = { _id: data._id, action: 'create' }
        rowOperatedStore.push(newRow)
        setRowOperated(rowOperatedStore)
      } else if (data._id === undefined) {
        // back-end auto generates data or previous month data from database
        data._id = uuid()
        const newRow = { _id: data._id, action: 'create' }
        rowOperatedStore.push(newRow)
        setRowOperated(rowOperatedStore)
      } else {
        const newRow = { _id: data._id, action: 'update' }
        rowOperatedStore.push(newRow)
        setRowOperated(rowOperatedStore)
      }

      setAlertMessages()
    }

    if (colId === 'property') {
      params.node.setDataValue('maintenance', maintenanceTotal[params.value])
    }

    if (colId === 'tenant_amount' || colId === 'company_amount') {
      params.node.setDataValue(
        'agent_amount',
        (tenant_amount * 0.08 * 1.05 - company_amount).toFixed(2)
      )
    }

    if (
      colId === 'tenant_amount' ||
      colId === 'agent_amount' ||
      colId === 'maintenance' ||
      colId === 'cra' ||
      colId === 'company_amount'
    ) {
      params.node.setDataValue(
        'landlord_amount',
        (
          tenant_amount -
          agent_amount -
          maintenance -
          cra -
          company_amount
        ).toFixed(2)
      )
    }

    if (colId === 'rent_date') {
      const current = new Date(selectedDate)
      const firstDay = new Date(current.getFullYear(), current.getMonth(), 1)
      const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0)
      const inputDate = new Date(params.value)

      if (inputDate > lastDay || inputDate < firstDay) {
        toast.error(`Don't modify previous data or add future data`)
        params.node.setDataValue(
          'rent_date',
          dayjs(current).format('YYYY-MM-DD')
        )
      }
    }
  }

  const addRow = useCallback(() => {
    const _id = uuid()
    // inital the empty row value in order to show the column aggregate correctly
    const emptyRow = {
      _id,
      tenant_amount: 0,
      landlord_amount: 0,
      agent_amount: 0,
      maintenance: 0,
      company_amount: 0,
      cra: 0
    }

    gridRef.current?.api.applyTransaction({
      add: [emptyRow]
    })

    rowImmutableStore.push(emptyRow)
  }, [])

  const onRemoveSelected = useCallback(() => {
    const selectedData = gridRef.current?.api.getSelectedRows()
    gridRef.current?.api.applyTransaction({
      remove: selectedData
    })
    const selectedIds = selectedData?.map((row) => row._id)
    selectedIds?.forEach((single) => {
      const dupIndex = rowOperatedStore.findIndex((item) => item._id === single)
      // avoid duplicated add row or update row
      if (dupIndex === -1) {
        if (!isUuid(single)) {
          const delRow = { _id: single, action: 'delete' }
          rowOperatedStore.push(delRow)
          setRowOperated(rowOperatedStore)

          setAlertMessages()
        }
      } else {
        rowOperatedStore.splice(dupIndex, 1)
        if (!isUuid(single)) {
          const delRow = { _id: single, action: 'delete' }
          rowOperatedStore.push(delRow)
        }
        setRowOperated(rowOperatedStore)

        setAlertMessages()
      }

      // remove row from rowData
      const delIndex = rowImmutableStore.findIndex(
        (data) => data._id === single
      )
      if (delIndex !== -1) {
        rowImmutableStore.splice(delIndex, 1)
      }
    })

    setSeverity('warning')
    setAlertContext(`Data changes were not submitted!`)
  }, [])

  function submit(): void {
    try {
      for (let i = 0; i < rowOperated.length; ++i) {
        // add new row
        if (Object.values(rowOperated[i])[1] === 'create') {
          const thisRow = rowData.find(
            (item) => item._id === Object.values(rowOperated[i])[0]
          )
          if (thisRow) {
            fetch(`${baseURL}/rents/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storage.getToken()}`
              },
              body: JSON.stringify({
                property: thisRow.property ? thisRow.property : '',
                // agent, // will insert at the back-end using authenticated user
                tenant: thisRow.tenant ? thisRow.tenant : '',
                tenant_amount: thisRow.tenant_amount
                  ? thisRow.tenant_amount
                  : 0,
                maintenance: thisRow.maintenance ? thisRow.maintenance : 0,
                landlord_amount: thisRow.landlord_amount
                  ? thisRow.landlord_amount
                  : 0,
                agent_amount: thisRow.agent_amount ? thisRow.agent_amount : 0,
                company_amount: thisRow.company_amount
                  ? thisRow.company_amount
                  : 0,
                cra: thisRow.cra ? thisRow.cra : 0,
                rent_date: thisRow.rent_date ? thisRow.rent_date : new Date(),
                rental_start: thisRow.rental_start
                  ? thisRow.rental_start
                  : new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ),
                rental_end: thisRow.rental_end
                  ? thisRow.rental_end
                  : new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      0
                    ),
                grant: thisRow.grant ? thisRow.grant : false,
                note: thisRow.note ? thisRow.note : ''
              })
            })
              .then((result) => result.json())
              .then((result) => {
                // avoid creating a new row when submit repeatedly
                thisRow._id = result.insertedId
              })
          }
        } // end add new row

        // update a row
        if (Object.values(rowOperated[i])[1] === 'update') {
          const thisRow = rowData.find(
            (item) => item._id === Object.values(rowOperated[i])[0]
          )
          if (thisRow) {
            fetch(`${baseURL}/rents/${thisRow._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storage.getToken()}`
              },
              body: JSON.stringify({
                property: thisRow.property ? thisRow.property : '',
                // agent, // can't be updated
                tenant: thisRow.tenant ? thisRow.tenant : '',
                tenant_amount: thisRow.tenant_amount
                  ? thisRow.tenant_amount
                  : 0,
                maintenance: thisRow.maintenance ? thisRow.maintenance : 0,
                landlord_amount: thisRow.landlord_amount
                  ? thisRow.landlord_amount
                  : 0,
                agent_amount: thisRow.agent_amount ? thisRow.agent_amount : 0,
                company_amount: thisRow.company_amount
                  ? thisRow.company_amount
                  : 0,
                cra: thisRow.cra ? thisRow.cra : 0,
                rental_start: thisRow.rental_start
                  ? thisRow.rental_start
                  : thisRow.rent_date,
                rental_end: thisRow.rental_end
                  ? thisRow.rental_end
                  : thisRow.rent_date,
                rent_date: thisRow.rent_date ? thisRow.rent_date : new Date(),
                grant: thisRow.grant ? thisRow.grant : false,
                note: thisRow.note ? thisRow.note : ''
              })
            })
              .then((result) => result.json())
              .then((result) => {})
          }
        } // end update a row

        // delete a row
        if (Object.values(rowOperated[i])[1] === 'delete') {
          // deleted row has been removed from rowData, so can't get the _id value from rowData as the Update or Create did
          const rowId = Object.values(rowOperated[i])[0]
          if (rowId) {
            fetch(`${baseURL}/rents/${rowId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storage.getToken()}`
              }
            })
              .then((result) => result.text())
              .then((result) => {})
          }
        } // end delete a row
      } // end for loop

      // reset the rowOperatedStore(associated rowOperated) Array avoid submitting repeatly
      rowOperatedStore.length = 0
    } catch (error) {
      setSeverity('error')
      setAlertContext(`failed to submit data`)
    }

    toast.success(`successfully submitted all data`)
    setSeverity('success')
    setAlertContext(`Data changes have been submitted`)
  }

  const monthlyReportParent = (id: string, date: string) => {
    if (id) {
      const year = date.slice(0, 4)
      const month = date.slice(5, 7)
      router.push({
        pathname: '/agent/monthlyreportPDF',
        query: { property_id: id, rent_year: year, rent_month: month }
      })
    }
  }

  const yearlyReportParent = (id: string, date: string) => {
    if (id) {
      const year = date.slice(0, 4)
      const month = date.slice(5, 7)
      router.push({
        pathname: '/agent/yearlyreportPDF',
        query: { property_id: id, rent_year: year, rent_month: month }
      })
    }
  }

  const handleDateChange = (params: any) => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1) // default time is 00:00:00, the first moment of first day
    const tenthDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      10,
      23,
      59,
      59,
      999
    ) // get the last moment (23:59:59:999) of the 10th day
    // const fifteenthDay = new Date(now.getFullYear(), now.getMonth(), 15)
    // const twentyDay = new Date(now.getFullYear(), now.getMonth(), 20)

    if (rowOperatedStore.length > 0) {
      setSeverity('warning')
      setAlertContext(`Data changes not be submitted`)
      return
    }

    setSelectedDate(params)
    loadData(params)

    if (params < firstDay || params > tenthDay) {
      setButtonState(true)
      setBtnSubmitState(true)
    } else {
      setButtonState(false)
      setBtnSubmitState(false)
    }
  }

  const onRowDataUpdated = (params: any) => {
    const firstRow = params.api.getDisplayedRowAtIndex(0)
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1) // default time is 00:00:00, the first moment of first day
    const fifthDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      5,
      23,
      59,
      59,
      999
    ) // get the last moment (23:59:59:999) of the 5th day
    const tenthDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      10,
      23,
      59,
      59,
      999
    )
    // const fifteenthDay = new Date(now.getFullYear(), now.getMonth(), 15)
    // const twentyDay = new Date(now.getFullYear(), now.getMonth(), 20)

    if (firstRow) {
      if (firstRow.data._id) {
        if (now >= firstDay && now <= fifthDay) {
          setSeverity('success')
          setAlertContext(
            `Your rent data of this month has submitted, you can modify your data before the 10th of this month`
          )
        } else if (now > fifthDay && now <= tenthDay) {
          // setButtonState(true)
          setSeverity('warning')
          setAlertContext(
            `Your rent data of this month has submitted, INFORM administrator after any modification`
          )
        } else {
          setButtonState(true)
          setBtnSubmitState(true)
          setSeverity('info')
          setAlertContext(
            `Your rent data of this month has submitted, modification has been PROHIBTED`
          )
        }
      } else {
        // add the row data to CREATE queue when loading the PREVIOUS month data
        if (rowImmutableStore) {
          for (let i = 0; i < rowImmutableStore.length; ++i) {
            if (
              !rowImmutableStore[i]._id &&
              rowImmutableStore[i].maintenance_pre != null
            ) {
              const uid = uuid()
              rowImmutableStore[i]._id = uid
              const newRow = { _id: uid, action: 'create' }
              rowOperatedStore.push(newRow)
              setRowOperated(rowOperatedStore)
            }
          }
        }

        if (now >= firstDay && now <= fifthDay) {
          setSeverity('warning')
          setAlertContext(
            `Your rent data of this month has NOT submitted, please submit your data before the 5th of this month`
          )
        }
        if (now > fifthDay && now <= tenthDay) {
          // setButtonState(true)
          setSeverity('error')
          setAlertContext(
            `Your rent data of this month has NOT submitted, INFORM administrator for any update`
          )
        }
        if (now > tenthDay) {
          setButtonState(true)
          setBtnSubmitState(true)
          setSeverity('info')
          setAlertContext(
            `Your rent data of this month has NOT submitted, modification has been PROHIBTED`
          )
        }
      }
    } else {
      setSeverity('info')
      setAlertContext('No Data Be Found')
    }
  }

  const getRowStyle = (params: any) => {
    if (params.node.footer) {
      return { background: '#eff066' }
    }
  }

  const statusBar = {
    statusPanels: [
      { statusPanel: 'agTotalRowCountComponent', align: 'left' },
      { statusPanel: 'agAggregationComponent' }
    ]
  }

  return (
    <div className="my-app">
      <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
        Rent Management
      </Typography>
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
        <Button
          variant="outlined"
          color="primary"
          onClick={() => addRow()}
          disabled={buttonState}
        >
          Add Row
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onRemoveSelected}
          disabled={buttonState}
        >
          Delete Row
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onRowEditingStopped}
          disabled={buttonState}
        >
          Stop Edit
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => submit()}
          disabled={btnSubmitState}
        >
          Submit Data
        </Button>
        <Alert variant="filled" severity={severity}>
          {alertContext}
        </Alert>
      </div>
      <label
        className="option"
        htmlFor="allColumns"
        style={{ fontSize: '18px', fontWeight: 'bold', color: 'red' }}
      >
        <input id="allColumns" type="checkbox" />
        Check here before exporting to excel !
      </label>
      <br />
      <Button
        variant="outlined"
        onClick={onBtExport}
        style={{ fontWeight: 'bold' }}
      >
        Export to Excel
      </Button>
      <Toaster position="top-center" />
      <Box
        id="myGrid"
        sx={{ height: '100%', width: '100%' }}
        className="ag-theme-alpine"
      >
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          onGridReady={onGridReady}
          getRowStyle={getRowStyle} // setting the style of row
          // editType="fullRow"   // Full Row Edit (requirement for onRowValueChanged event)
          rowSelection="multiple"
          components={Components}
          // onRowValueChanged={onRowValueChanged} // cooperate with editType="fullrow"
          onCellValueChanged={onCellValueChanged}
          onRowDataUpdated={onRowDataUpdated}
          context={{ monthlyReportParent, yearlyReportParent }} // Parent/Child Communication using context
          statusBar={statusBar}
          enableRangeSelection
          groupIncludeTotalFooter
          rowGroupPanelShow="never"
          groupDefaultExpanded={1}
          suppressAggFuncInHeader
        />
      </Box>
    </div>
  )
}

export default Rent
