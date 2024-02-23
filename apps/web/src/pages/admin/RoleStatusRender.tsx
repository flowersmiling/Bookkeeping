/* eslint-disable react/function-component-definition */
/* eslint-disable react/react-in-jsx-scope */
import { Box } from '@mui/material'
import get from 'lodash/get'

import {
  ROLE_STATUS_STYLE_MAP,
  ROLE_STATUS_MAP
} from '../../constants/constants'

interface RoleStatusRender {
  value: number
}
export default function RoleRender({ value: role }: RoleStatusRender) {
  return (
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
        ...get(ROLE_STATUS_STYLE_MAP, role, {})
      }}
    >
      {get(ROLE_STATUS_MAP, role, 'Unknown')}
    </Box>
  )
}
