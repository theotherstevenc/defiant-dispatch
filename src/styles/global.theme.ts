import { createTheme } from '@mui/material/styles'

import { FOCUS_OUTLINE_COLOR } from '../utils/constants'

const focusVisible = {
  outline: '2px solid ' + FOCUS_OUTLINE_COLOR,
  outlineOffset: '2px',
}

const sharedComponentProps = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: true,
      enterDelay: 1000,
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        ':focus-visible': focusVisible,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        ':focus-visible': focusVisible,
      },
    },
  },
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#fff',
    },
  },
  components: sharedComponentProps,
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b3b3b3',
    },
  },
  components: sharedComponentProps,
})
