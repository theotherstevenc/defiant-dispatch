import { useMediaQuery } from '@mui/material'

import { useAppContext } from '../context/AppContext'
import { darkTheme, lightTheme } from '../styles/global.theme'

export const usePreferredTheme = () => {
  const { appColorScheme } = useAppContext()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  if (appColorScheme === 'system') {
    return prefersDarkMode ? darkTheme : lightTheme
  }
  return appColorScheme === 'dark' ? darkTheme : lightTheme
}
