import { useMediaQuery } from '@mui/material'

import { useThemeSettingsContext } from '../context/ThemeSettingsContext'
import { darkTheme, lightTheme } from '../styles/global.theme'

export const usePreferredTheme = () => {
  const { appColorScheme } = useThemeSettingsContext()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  if (appColorScheme === 'system') {
    return prefersDarkMode ? darkTheme : lightTheme
  }
  return appColorScheme === 'dark' ? darkTheme : lightTheme
}
