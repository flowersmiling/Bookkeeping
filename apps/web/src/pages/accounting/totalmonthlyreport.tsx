/* eslint-disable consistent-return */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */

import React, { useMemo, useState, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ColDef } from 'ag-grid-community'
import Typography from '@mui/material/Typography'
import { Button, TextField } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
// eslint-disable-next-line import/namespace
// import MyInnerRenderer from './landlord-billing/myInnerRenderer'
import { useUser } from '../../lib/auth'
import { storage } from '../../lib/utils'

const totalmonthlyreport = () => {
  const [rowData, setRowData] = useState(null)
  const gridRef = useRef<AgGridReact<any>>(null)
  const [selectedDate, setSelectedDate] = useState<any>(new Date())
  const [gridApi, setGridApi] = useState(null)
  const [columnApi, setColumnApi] = useState(null)
  // const agent = '638849a7aaba034c6e4b8c18'
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), [])
  const gridStyle = useMemo(() => ({ height: 1000, width: '100%' }), [])

  // const formatNumber = (number:any ) =>number.getValue.toFxied(2)

  function currencyFormatter(params: any) {
    const number = params.value
    const fixedNumber = parseFloat(number).toFixed(2)
    return number === undefined ? '' : `${fixedNumber}`
  }

  const [columnDefs] = useState<ColDef[]>([
    {
      field: 'agent_fullname',
      rowGroup: true,
      hide: true,
      headerName: 'Agent',
      cellClass: ['greenBackground']
    },

    { field: 'prop_address', headerName: 'Address' },
    { field: 'property_docs.landlord', headerName: 'Landlord' },

    {
      field: 'tenant_amount',
      aggFunc: 'sum',
      valueParser: 'Number(newValue)',
      headerName: 'Tenant Amount',
      valueFormatter: currencyFormatter
    },
    {
      field: 'landlord_amount',
      aggFunc: 'sum',
      valueParser: 'Number(newValue)',
      headerName: 'Landlord Amount',
      valueFormatter: currencyFormatter,
      cellStyle: (params: any) => {
        if (!params.node.footer) {
          return { background: '#c2f5c0' }
        }
      }
    },
    {
      field: 'agent_amount',
      aggFunc: 'sum',
      valueParser: 'Number(newValue)',
      headerName: 'Agent Amount',
      valueFormatter: currencyFormatter
    },
    {
      field: 'maintenance',
      aggFunc: 'sum',
      valueParser: 'Number(newValue)',
      valueFormatter: currencyFormatter
    },
    {
      field: 'cra',
      aggFunc: 'sum',
      valueParser: 'Number(newValue)',
      headerName: 'CRA',
      valueFormatter: currencyFormatter
    },

    {
      field: 'company_amount',
      aggFunc: 'sum',
      valueParser: 'Number(newValue)',
      headerName: 'Company Amount',
      valueFormatter: currencyFormatter
    },
    {
      headerName: 'Total Recived',
      colId: 'total',
      cellClass: ['number-cell', 'total-col'],
      valueParser: 'Number(newValue)',
      headerClass: 'gold-header',
      valueFormatter: currencyFormatter,
      // aggFunc: 'sum',
      // valueFormatter: formatNumber,
      valueGetter: (params: any) => {
        const landlord = params.getValue('landlord_amount')
        const agent = params.getValue('agent_amount')
        const cra = params.getValue('cra')
        const maintenance = params.getValue('maintenance')
        const company = params.getValue('company_amount')
        const total = (landlord + agent + cra + maintenance + company).toFixed(
          2
        )

        // callCount++;
        return total
      }
    },
    { field: 'tenant' },
    { field: 'property_docs.account', headerName: 'Landlord Account' },
    { field: 'note', headerName: 'Note' }
  ])

  const getRowStyle = (params: any) => {
    if (params.node.footer) {
      return { background: '#eff066' }
    }
  }

  // const excelStyle = useMemo(
  //   () => [
  //     {
  //       id: 'cell',
  //       alignment: {
  //         vertical: 'Center'
  //       }
  //     },
  //     {
  //       id: 'gold-header',
  //       interior: {
  //         color: '#f0b81c',
  //         pattern: 'Solid'
  //       }
  //     },
  //     {
  //       id: 'greenBackground',
  //       interior: {
  //         color: '#a6cda6',
  //         pattern: 'Solid'
  //       }
  //     },
  //     {
  //       id: 'redFont',
  //       font: {
  //         fontName: 'Calibri Light',
  //         underline: 'Single',
  //         italic: true,
  //         color: '#ff0000'
  //       }
  //     },
  //     {
  //       id: 'darkGreyBackground',
  //       interior: {
  //         color: '#5b5a5a',
  //         pattern: 'Solid'
  //       },
  //       font: {
  //         fontName: 'Calibri Light',
  //         color: '#ffffff'
  //       }
  //     }
  //   ],
  //   []
  // )
  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: 150,
      sortable: true,
      resizable: true
    }),
    []
  )

  // const autoGroupColumnDef = useMemo(
  //   () => ({
  //     minWidth: 300,
  //     cellRendererParams: {
  //       footerValueGetter: (params: any) => {
  //         const { node } = params;
  //         if (!node.footer) {
  //           return `Sub-Total: ${node.key}`;
  //         }
  //         const isRootLevel = node.level === -1;
  //         if (isRootLevel) {
  //           return `Grand Total`;
  //         }
  //         return `Sub Total  (${params.value})`;
  //       }
  //     }
  //   }),
  //   []
  // )
  const getParams = () => ({
    processCellCallback(params: any) {
      const { value } = params
      return value === undefined ? '' : `${value}`
    },
    processRowGroupCallback(params: any) {
      const { node } = params
      if (!node.footer) {
        return `Sub-Total: ${node.key}`
      }
      const isRootLevel = node.level === -1
      if (isRootLevel) {
        return `Grand Total`
      }
      return `**Sub Total  ${node.key}**`
    }
  })
  const defaultExcelExportParams = useMemo(() => getParams(), [])
  const baseURL = process.env.NEXT_PUBLIC_API_URL
  const headers = { Authorization: `Bearer ${storage.getToken()}` }

  const loadData = (params: Date) => {
    const year = params.getFullYear()
    const month = params.getMonth()

    fetch(`${baseURL}/adminreport/${year}/${month}`, { headers })
      .then((resp) => resp.json())
      .then((result) => setRowData(result))
  }

  const onGridReady = (params: any) => {
    setGridApi(params.api)
    setColumnApi(params.columnApi)
    loadData(new Date())
  }

  const handleDateChange = (params: any) => {
    setSelectedDate(params)
    loadData(params)
  }

  const onBtExport = useCallback(() => {
    ;(gridRef.current as any).api.exportDataAsExcel()
  }, [])
  const { data: user, isSuccess } = useUser()

  return (
    <div style={containerStyle}>
      {isSuccess && user.role === 202 ? (
        <div style={gridStyle} className="ag-theme-alpine">
          <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
            Admin Monthly Work Sheet
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
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
            onClick={onBtExport}
            style={{ margin: '15px', fontWeight: 'bold' }}
          >
            Export to Excel
          </Button>

          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            defaultExcelExportParams={defaultExcelExportParams}
            groupIncludeFooter={true}
            groupIncludeTotalFooter={true}
            suppressAggFuncInHeader={true}
            animateRows={true}
            getRowStyle={getRowStyle}
            // excelStyles={excelStyle}
            onGridReady={onGridReady}
          />
        </div>
      ) : (
        <div>
          <h1>You are not authoritzed in this page</h1>
        </div>
      )}
    </div>
  )
}

export default totalmonthlyreport
