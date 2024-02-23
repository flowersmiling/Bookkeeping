import { Box, FormControl, MenuItem, Select } from '@mui/material'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import get from 'lodash/get'
import { ROLE_MAP, ROLE_STYLE_MAP } from '../../constants/constants'

const transformIntoArray = <T extends Record<string, string>>(obj: T) => {
  const entries = Object.entries(obj).map(([key, value]) => ({ key, value }))
  return entries
}

const ROLE_OTPS = transformIntoArray(ROLE_MAP)

const RoleEditor = forwardRef((props: any, ref) => {
  const [status, setStatus] = useState(props.value)

  const handleChangeEvent = (event: any) => {
    setStatus(event.target.value)
  }

  useImperativeHandle(ref, () => ({
    getValue: () => status
  }))

  return (
    <FormControl variant="outlined" sx={{ width: '100%' }}>
      <Select
        labelId="Role--label"
        displayEmpty
        value={status}
        label=""
        onChange={handleChangeEvent}
      >
        {ROLE_OTPS.map((otp) => (
          <MenuItem key={otp.value} value={otp.key}>
            <Box
              sx={{
                textTransform: 'capitalize',
                height: '22px',
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '6px',
                px: '8px',
                py: '1px',
                ...get(ROLE_STYLE_MAP, otp.key, {})
              }}
            >
              {otp.value}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
})

export default RoleEditor
