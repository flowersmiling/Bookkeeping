/* eslint-disable react-hooks/rules-of-hooks */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import type { AgGridReact as AgGridReactType } from 'ag-grid-react/lib/agGridReact'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { Button, Typography } from '@mui/material'
import dayjs from 'dayjs'

const yearlyreport = () => {
  const [rowData, setRowData] = useState()
  const gridRef = useRef<AgGridReactType>(null as unknown as AgGridReactType)

  const [columnDefs] = useState([
    {
      headerName:
        'HOMECARE REALTY LTD.  ,  2312 5 Ave NW Calgary ,  TEL:587-432-1588',
      children: [
        {
          headerName: 'Lnadlord Property Yearly Statement',
          children: [
            {
              field: 'rent_date',
              suppressSizeToFit: true,
              rowGroup: true,
              rowGroupIndex: 0,
              headerName: 'Transcation Date',
              cellRenderer: (params: { value: any }) => {
                if (params.value === undefined) {
                  return dayjs().format('YYYY-MMM') // set default value for adding new row
                }
                return dayjs(params.value.slice(0, 10)).format('YYYY-MMM')
              }
            },
            {
              field: 'property_docs.landlord',
              width: 150,
              // rowGroup: true,

              headerName: 'Landlord Name'
            },
            {
              field: 'prop_address',
              headerName: 'Address',
              width: 290
            },
            {
              field: 'property_docs.email',
              headerName: 'Landlord Email',
              width: 190
            },
            {
              field: 'agent_docs.mobile',

              width: 150,
              pivotIndex: 0,
              headerName: 'Agent Phone'
            }
          ]
        },
        {
          headerName: 'Earning Infomation',
          children: [
            { field: 'tenant_amount', width: 150 },
            { field: 'agent_amount', width: 150 },
            { field: 'cra', width: 100 },
            { field: 'maintenance', width: 150 },
            {
              headerName: 'GST',
              cellClass: 'number-cell',
              aggFunc: 'sum',
              width: 100,

              valueGetter: (params: any) => {
                const agent = params.getValue('agent_amount')

                const GST = (agent * 0.05).toFixed(2)

                return GST
              }
            },
            {
              headerName: 'NET',
              cellClass: 'number-cell',
              aggFunc: 'sum',
              width: 100,

              valueGetter: (params: any) => {
                const tenant = params.getValue('tenant_amount')
                const agent = params.getValue('agent_amount')
                const cra = params.getValue('cra')
                const maintenance = params.getValue('maintenance')
                const NET = (tenant - (agent + cra + maintenance)).toFixed(2)

                return NET
              }
            },
            {
              headerName: 'Landlord Total',
              cellClass: 'number-cell',
              aggFunc: 'sum',
              width: 150,

              valueGetter: (params: any) => {
                const tenant = params.getValue('tenant_amount')
                const agent = params.getValue('agent_amount')
                const cra = params.getValue('cra')
                const maintenance = params.getValue('maintenance')
                const total = (
                  tenant -
                  (agent + cra + maintenance) -
                  agent * 0.05
                ).toFixed(2)

                return total
              }
            }
          ]
        }
      ]
    }
  ])

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      initialWidth: 200,
      wrapHeaderText: true,
      autoHeaderHeight: true
    }),
    []
  )

  // rent id
  const onGridReady = useCallback(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/adminreport/63edb7daa1aa1b5b05ef1ecf`
    )
      .then((resp) => resp.json())
      .then((data) => setRowData(data))
  }, [])

  const onBtExport = useCallback(() => {
    gridRef.current.api.exportDataAsExcel()
  }, [])

  return (
    <div style={{ height: 800, width: '100%' }}>
      <div style={{ height: 800, width: '100%' }} className="ag-theme-alpine">
        <h1>Monthly Report</h1>
        <div>
          <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
            Property Yearly Report
          </Typography>
          <Button
            variant="outlined"
            onClick={onBtExport}
            style={{ marginBottom: '5px', fontWeight: 'bold' }}
          >
            Export to Excel
          </Button>
        </div>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          // eslint-disable-next-line react/jsx-boolean-value
          suppressAggFuncInHeader={true}
          groupHeaderHeight={150}
          floatingFiltersHeight={50}
          pivotGroupHeaderHeight={50}
          pivotHeaderHeight={100}
          animateRows
          onGridReady={onGridReady}
        />
      </div>
    </div>
  )
}

export default yearlyreport
