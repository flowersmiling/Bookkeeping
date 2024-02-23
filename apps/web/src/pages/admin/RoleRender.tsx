/* eslint-disable react/function-component-definition */
/* eslint-disable react/react-in-jsx-scope */
import { Box } from '@mui/material'
import get from 'lodash/get'

import { ROLE_STYLE_MAP, ROLE_MAP } from '../../constants/constants'

interface RoleRoleCellProps {
  value: number
}
export default function RoleRender({ value: role }: RoleRoleCellProps) {
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
        ...get(ROLE_STYLE_MAP, role, {})
      }}
    >
      {get(ROLE_MAP, role, 'Unknown')}
    </Box>
  )
}
