import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Dayjs } from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
// must use AdapterDateFns so that to match AG-Grid 'agDateColumnFilter' dateFilter component
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DesktopDatePicker } from '@mui/x-date-pickers'
import { TextField } from '@mui/material'

export default forwardRef((props: any, ref) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)

  const handleDateChange = (newValue: Dayjs | null) => {
    setSelectedDate(newValue)
    props.onDateChanged()
  }

  // TODO: may need refactor
  // useEffect(props.onDateChanged, [selectedDate])

  useImperativeHandle(ref, () => ({
    getDate: () => selectedDate,
    setDate: (newValue: Dayjs | null) => {
      setSelectedDate(newValue)
    }
  }))

  return (
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
