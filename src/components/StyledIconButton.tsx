import { styled, IconButton } from '@mui/material'

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  minWidth: 44,
  minHeight: 44,
  padding: '6px 16px',
  borderRadius: '4px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))
