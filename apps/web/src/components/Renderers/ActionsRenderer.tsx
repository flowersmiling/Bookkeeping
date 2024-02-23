/* eslint-disable no-underscore-dangle */
/* eslint-disable react/destructuring-assignment */
import { Button } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useComponentWillMount } from '../../lib/utils'

const ActionsRenderer = (props: any) => {
  const [editing, setEditing] = useState(false)
  const [disabled, setDisabled] = useState(false)

  // custom hook
  useComponentWillMount(() => {
    const editingCells = props.api.getEditingCells()
    if (editingCells.length !== 0) {
      setDisabled(true)
    }
  })

  function onRowEditingStarted(params: any) {
    if (props.node === params.node) {
      setEditing(true)
    } else {
      setDisabled(true)
    }
  }

  function isEmptyRow(data: any) {
    const dataCopy = { ...data }
    delete dataCopy.id
    return !Object.values(dataCopy).some((value) => value)
  }

  function deleteRow(force = false) {
    const { data, context } = props // Parent/Child Communication using context

    let confirm = true
    if (!force) {
      confirm = true
    }
    if (confirm) {
      props.api.applyTransaction({ remove: [data] })
      props.api.refreshCells({ force: true })
      context.methodFromParent(data._id, data.maintenance_date) // pass the data to the parent component
    }
  }

  function onRowEditingStopped(params: any) {
    if (props.node === params.node) {
      if (isEmptyRow(params.data)) {
        deleteRow(true)
      } else {
        setEditing(false)
      }
    } else {
      setDisabled(false)
    }
  }

  // TODO: check the result,  removed dependency
  useEffect(() => {
    props.api.addEventListener('rowEditingStarted', onRowEditingStarted)
    props.api.addEventListener('rowEditingStopped', onRowEditingStopped)

    return () => {
      props.api.removeEventListener('rowEditingStarted', onRowEditingStarted)
      props.api.removeEventListener('rowEditingStopped', onRowEditingStopped)
    }
  })

  function startEditing() {
    props.api.startEditingCell({
      rowIndex: props.rowIndex,
      colKey: props.column.colId
    })
  }

  function stopEditing(bool: boolean) {
    props.api.stopEditing(bool)
  }

  return (
    <div>
      {editing ? (
        <>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={() => stopEditing(false)}
            disabled={disabled}
          >
            Update
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={() => stopEditing(true)}
            disabled={disabled}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            color="primary"
            variant="outlined"
            onClick={() => startEditing()}
            disabled={disabled}
          >
            Edit
          </Button>
          <Button
            type="button"
            color="secondary"
            variant="outlined"
            onClick={() => deleteRow()}
            disabled={disabled}
          >
            Delete
          </Button>
        </>
      )}
    </div>
  )
}

export default ActionsRenderer
