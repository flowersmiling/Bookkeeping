/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react/jsx-no-bind */

import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { format } from 'date-fns'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { TextField } from '@mui/material'

export default forwardRef((props: any, ref) => {
  const [selectedDate, setSelectedDate] = useState<any>(null)
  const isFooter = () => {
    // don't display in the AG-Grid footer
    if (props.node.footer) {
      return true
    }
    return false
  }

  function handleDateChange(d: any) {
    if (d) {
      d.setHours(0, 0, 0, 0) // set time to midnight
    }
    setSelectedDate(d)
  }

  useImperativeHandle(ref, () => ({
    getValue: () => {
      let dateString = null
      if (selectedDate) {
        dateString = format(selectedDate, 'yyyy-MM-dd')
      }
      return dateString
    },
    isCancelAfterEnd: () => !selectedDate,
    afterGuiAttached: () => {
      if (!props.value) {
        return
      }
      const [_, day, month, year] = props.value.match(/(\d{4})-(\d{2})-(\d{2})/)
      const pickedDate = new Date(year, month - 1, day)
      setSelectedDate(pickedDate)
    }
  }))

  return isFooter() ? (
    <span />
  ) : (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopDatePicker
        inputFormat="yyyy-MM-dd"
        value={selectedDate}
        onChange={handleDateChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  )
})
