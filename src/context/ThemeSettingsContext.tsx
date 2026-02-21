/* eslint-disable react-refresh/only-export-components */
import { doc, onSnapshot } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { db } from '../firebase'
import { ThemeSettingsContextProps } from '../interfaces'
import { FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS } from '../utils/constants'
import { logError } from '../utils/logError'

import { useAuthContext } from './AuthContext'

const ThemeSettingsContext = createContext<ThemeSettingsContextProps | undefined>(undefined)

export const ThemeSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext()

  const [appColorScheme, setAppColorScheme] = useState<string>('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isPreviewDarkMode, setIsPreviewDarkMode] = useState(false)

  useEffect(() => {
    if (!user) return

    const editorSettings = doc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS)
    const unsubscribe = onSnapshot(
      editorSettings,
      (doc) => {
        const data = doc.data()
        if (data) {
          const {
            isDarkMode: nextIsDarkMode = false,
            isPreviewDarkMode: nextIsPreviewDarkMode = false,
            appColorScheme: nextAppColorScheme = '',
          } = data

          setIsDarkMode((prev) => (prev === nextIsDarkMode ? prev : nextIsDarkMode))
          setIsPreviewDarkMode((prev) => (prev === nextIsPreviewDarkMode ? prev : nextIsPreviewDarkMode))
          setAppColorScheme((prev) => (prev === nextAppColorScheme ? prev : nextAppColorScheme))
        }
      },
      (error) => {
        logError('An error occurred while fetching theme settings', 'ThemeSettingsContext', error)
      }
    )

    return () => {
      unsubscribe()
      setIsDarkMode(false)
      setIsPreviewDarkMode(false)
      setAppColorScheme('')
    }
  }, [user])

  const value = useMemo<ThemeSettingsContextProps>(
    () => ({
      isDarkMode,
      setIsDarkMode,
      isPreviewDarkMode,
      setIsPreviewDarkMode,
      appColorScheme,
      setAppColorScheme,
    }),
    [isDarkMode, isPreviewDarkMode, appColorScheme]
  )

  return <ThemeSettingsContext.Provider value={value}>{children}</ThemeSettingsContext.Provider>
}

export const useThemeSettingsContext = (): ThemeSettingsContextProps => {
  const context = useContext(ThemeSettingsContext)
  if (context === undefined) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('useThemeSettingsContext must be used within a ThemeSettingsProvider')
    } else {
      throw new Error('Theme settings context is not available.')
    }
  }
  return context
}
