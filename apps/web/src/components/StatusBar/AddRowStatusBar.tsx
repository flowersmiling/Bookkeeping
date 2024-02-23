/* eslint-disable react/destructuring-assignment */
import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { uuid } from 'uuidv4'

// import "./AddRowStatusBar.css";

const AddRowStatusBar = (props: any) => {
  const [editing, setEditing] = useState(false)

  function onRowEditingStarted() {
    setEditing(true)
  }

  function onRowEditingStopped() {
    setEditing(false)
  }

  useEffect(() => {
    props.api.addEventListener('rowEditingStarted', onRowEditingStarted)
    props.api.addEventListener('rowEditingStopped', onRowEditingStopped)

    return () => {
      props.api.removeEventListener('rowEditingStarted', onRowEditingStarted)
      props.api.removeEventListener('rowEditingStopped', onRowEditingStopped)
    }
  }, [props.api])

  function addRow() {
    const id = uuid()
    const emptyRow = { id }
    props.api.applyTransaction({ add: [emptyRow] })

    // const node = props.api.getRowNode(id)
    // props.api.ensureIndexVisible(node.rowIndex)

    // setTimeout(() => {
    //   props.api.startEditingCell({
    //     rowIndex: node.rowIndex,
    //     colKey: props.columnApi.getAllColumns()[0].colId
    //   })
    // }, 300)
  }

  return (
    <div className="add-btn-container">
      <Button
        variant={editing ? 'outlined' : 'contained'}
        color="primary"
        onClick={() => addRow()}
        disabled={editing}
      >
        Add Row
      </Button>
    </div>
  )
}

export default AddRowStatusBar
