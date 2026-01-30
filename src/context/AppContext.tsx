/* eslint-disable react-refresh/only-export-components */
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useReducer, useState } from 'react'

import { auth, db } from '../firebase'
import { AppContextProps, EditorSettings, EditorSettingsAction } from '../interfaces'
import { logError } from '../utils/logError'

const AppContext = createContext<AppContextProps | undefined>(undefined)

// Initial state for editor settings
const initialSettings: EditorSettings = {
  subject: '',
  host: '',
  port: '',
  username: '',
  pass: '',
  from: '',
  isMinifyEnabled: false,
  isWordWrapEnabled: false,
  isPreventThreadingEnabled: false,
  activeEditor: '',
  emailAddresses: [],
  hideWorkingFiles: true,
  isDarkMode: false,
  isPreviewDarkMode: false,
  appColorScheme: '',
}

// Reducer function for managing editor settings
function editorSettingsReducer(state: EditorSettings, action: EditorSettingsAction): EditorSettings {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, ...action.payload }
    case 'UPDATE_SETTING':
      return { ...state, [action.key]: action.value }
    case 'RESET_SETTINGS':
      return initialSettings
    default:
      return state
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, dispatch] = useReducer(editorSettingsReducer, initialSettings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        // Reset settings when user logs out
        dispatch({ type: 'RESET_SETTINGS' })
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    const editorSettings = doc(db, 'config', 'editorSettings')
    const unsubscribe = onSnapshot(
      editorSettings,
      (doc) => {
        const data = doc.data()
        if (data) {
          // Single atomic update instead of multiple setter calls
          dispatch({
            type: 'SET_SETTINGS',
            payload: {
              subject: data.subject ?? '',
              host: data.host ?? '',
              port: data.port ?? '',
              username: data.username ?? '',
              pass: data.pass ?? '',
              from: data.from ?? '',
              isMinifyEnabled: data.isMinifyEnabled ?? false,
              isWordWrapEnabled: data.isWordWrapEnabled ?? false,
              isPreventThreadingEnabled: data.isPreventThreadingEnabled ?? false,
              activeEditor: data.activeEditor ?? '',
              emailAddresses: data.emailAddresses ?? [],
              hideWorkingFiles: data.hideWorkingFiles ?? true,
              isDarkMode: data.isDarkMode ?? false,
              isPreviewDarkMode: data.isPreviewDarkMode ?? false,
              appColorScheme: data.appColorScheme ?? '',
            },
          })
        }
        setLoading(false)
        setError(null)
      },
      (error) => {
        logError('An error occurred while fetching app context data', 'AppContext', error)
        setLoading(false)
        setError(error as Error)
      }
    )

    return () => unsubscribe()
  }, [user])

  return (
    <AppContext.Provider
      value={{
        settings,
        dispatch,
        loading,
        error,
        user,
      }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext)
  if (context === undefined) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('useAppContext must be used within an AppProvider')
    } else {
      throw new Error('App context is not available.')
    }
  }
  return context
}
