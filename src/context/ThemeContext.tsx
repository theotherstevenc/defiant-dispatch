/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer } from 'react'

export interface ThemeSettings {
  isDarkMode: boolean
  isPreviewDarkMode: boolean
  appColorScheme: string
}

export type ThemeAction =
  | { type: 'SET_THEME_SETTINGS'; payload: Partial<ThemeSettings> }
  | { type: 'UPDATE_THEME_SETTING'; key: keyof ThemeSettings; value: ThemeSettings[keyof ThemeSettings] }
  | { type: 'RESET_THEME_SETTINGS' }

export interface ThemeContextProps {
  themeSettings: ThemeSettings
  dispatchTheme: React.Dispatch<ThemeAction>
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

const initialThemeSettings: ThemeSettings = {
  isDarkMode: false,
  isPreviewDarkMode: false,
  appColorScheme: '',
}

function themeSettingsReducer(state: ThemeSettings, action: ThemeAction): ThemeSettings {
  switch (action.type) {
    case 'SET_THEME_SETTINGS':
      return { ...state, ...action.payload }
    case 'UPDATE_THEME_SETTING':
      return { ...state, [action.key]: action.value }
    case 'RESET_THEME_SETTINGS':
      return initialThemeSettings
    default:
      return state
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeSettings, dispatchTheme] = useReducer(themeSettingsReducer, initialThemeSettings)

  return <ThemeContext.Provider value={{ themeSettings, dispatchTheme }}>{children}</ThemeContext.Provider>
}

export const useThemeContext = (): ThemeContextProps => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
