import { useMediaQuery } from '@mui/material'

import { useAppContext } from '../context/AppContext'
import { darkTheme, lightTheme } from '../styles/global.theme'

export const usePreferredTheme = () => {
  const { settings } = useAppContext()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const effectiveScheme = settings.appColorScheme || 'system'
  if (effectiveScheme === 'system') {
    return prefersDarkMode ? darkTheme : lightTheme
  }
  return effectiveScheme === 'dark' ? darkTheme : lightTheme
}
