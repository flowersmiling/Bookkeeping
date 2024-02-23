/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react' // the AG Grid React Component

import 'ag-grid-community/styles/ag-grid.css' // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css' // Optional theme CSS

import {
  CellValueChangedEvent,
  ColDef,
  RowValueChangedEvent
} from 'ag-grid-community'

type Maintenance = {
  _id: string
  property: string
  item: string
  maintenance_date: Date
  amount: number
}

const columns = [
  { field: '_id', headerName: 'ID' },
  { field: 'property', headerName: 'Property', editable: true },
  { field: 'item', headerName: 'Item', editable: true },
  { field: 'maintenance_date', headerName: 'Maintenance_date', editable: true },
  { field: 'amount', headerName: 'Amount', editable: true }
]

const test = () => {
  // Optional - for accessing Grid's API
  const gridRef = useRef<AgGridReact>(null)
  // Set rowData to Array of Objects, one Object per Row
  const [rowData, setRowData] = useState<Maintenance[]>([])
  // Each Column Definition results in one Column.
  const [columnDefs] = useState<ColDef[]>(columns)
  // const containerStyle = useMemo(() => ({ width: '100%', height: '80%' }), []);
  // const gridStyle = useMemo(() => ({ height: '80%', width: '100%' }), []);

  // load data from API sever
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/`)
      .then((result) => result.json())
      .then((result) => setRowData(result))
  }, [])

  // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      editable: true,
      sortable: true
    }),
    []
  )

  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    console.log(`onCellValueChanged: ${event.colDef.field} = ${event.newValue}`)
  }, [])

  const onRowValueChanged = useCallback((event: RowValueChangedEvent) => {
    const { data } = event
    console.log(
      `onRowValueChanged: (${data.amount}, ${data.property}, ${data.item}, ${data.maintenance_date})`
    )
  }, [])

  const onBtStopEditing = useCallback(() => {
    gridRef.current!.api.stopEditing()
  }, [])

  const onBtStartEditing = useCallback(() => {
    gridRef.current!.api.setFocusedCell(1, 'make')
    gridRef.current!.api.startEditingCell({
      rowIndex: 1,
      colKey: 'make'
    })
  }, [])

  return (
    <div className="example-wrapper">
      <div style={{ marginBottom: '5px' }}>
        <button
          type="button"
          style={{ fontSize: '24px' }}
          onClick={onBtStartEditing}
        >
          Start Editing Line 2
        </button>
        <button
          type="button"
          style={{ fontSize: '12px' }}
          onClick={onBtStopEditing}
        >
          Stop Editing
        </button>
      </div>
      <div className="ag-theme-alpine" style={{ height: 800, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          ref={gridRef}
          defaultColDef={defaultColDef}
          editType="fullRow"
          onCellValueChanged={onCellValueChanged}
          onRowValueChanged={onRowValueChanged}
        />
      </div>
    </div>
  )
}

export default test
