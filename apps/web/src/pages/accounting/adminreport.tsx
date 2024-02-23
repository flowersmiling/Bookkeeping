/* eslint-disable react/jsx-boolean-value */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable react-hooks/rules-of-hooks */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const adminreport = () => {
  const gridRef = useRef()
  const containerStyle = useMemo(() => ({ width: '100', height: '100%' }), [])
  const gridStyle = useMemo(() => ({ height: 1000, width: '100%' }), [])
  const [rowData, setRowData] = useState()
  const [columnDefs, setColumnDefs] = useState([
    { field: 'athlete', minWidth: 200 },
    { field: 'country', minWidth: 200, rowGroup: true, hide: true },
    { field: 'sport', minWidth: 150 },
    { field: 'gold', aggFunc: 'sum' }
  ])

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 150,
      sortable: true,
      filter: true,
      resizable: true
    }),
    []
  )

  const getParams = () => ({
    processCellCallback(params: any) {
      const { value } = params
      return value === undefined ? '' : `_${value}`
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
      return `Sub Total  (${params.value})`
    }
  })
  const defaultExcelExportParams = useMemo(() => getParams(), [])

  const onGridReady = useCallback((params: any) => {
    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
      .then((resp) => resp.json())
      .then((data) =>
        setRowData(data.filter((rec: any) => rec.country != null))
      )
  }, [])

  return (
    <div style={containerStyle}>
      <div className="container">
        <div>
          {/* <button
              onClick={onBtExport}
              style={{ margin: '5px 0px', fontWeight: 'bold' }}
            >
              Export to Excel
            </button> */}
        </div>
        <div className="grid-wrapper">
          <div style={gridStyle} className="ag-theme-alpine">
            <AgGridReact
              ref={gridRef as any}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              groupIncludeFooter={true}
              groupIncludeTotalFooter={true}
              defaultExcelExportParams={defaultExcelExportParams}
              onGridReady={onGridReady}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default adminreport
