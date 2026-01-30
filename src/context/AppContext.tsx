/* eslint-disable react-refresh/only-export-components */
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useState } from 'react'

import { auth, db } from '../firebase'
import { logError } from '../utils/logError'

import { EditorSettingsProvider, useEditorSettingsContext } from './EditorSettingsContext'
import { EmailProvider, useEmailContext } from './EmailContext'
import { ThemeProvider, useThemeContext } from './ThemeContext'

// Auth Context for user state
export interface AuthContextProps {
  user: User | null
  loading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

// Firestore Sync Component - handles syncing Firestore to contexts
const FirestoreSync: React.FC<{ user: User | null }> = ({ user }) => {
  const { dispatchTheme } = useThemeContext()
  const { dispatchEditorConfig } = useEditorSettingsContext()
  const { dispatchEmail } = useEmailContext()

  useEffect(() => {
    if (!user) {
      // Reset all contexts when user logs out
      dispatchTheme({ type: 'RESET_THEME_SETTINGS' })
      dispatchEditorConfig({ type: 'RESET_EDITOR_CONFIG_SETTINGS' })
      dispatchEmail({ type: 'RESET_EMAIL_SETTINGS' })
      return
    }

    const editorSettings = doc(db, 'config', 'editorSettings')
    const unsubscribe = onSnapshot(
      editorSettings,
      (doc) => {
        const data = doc.data()
        if (data) {
          // Update theme settings
          dispatchTheme({
            type: 'SET_THEME_SETTINGS',
            payload: {
              isDarkMode: data.isDarkMode ?? false,
              isPreviewDarkMode: data.isPreviewDarkMode ?? false,
              appColorScheme: data.appColorScheme ?? '',
            },
          })

          // Update editor config settings
          dispatchEditorConfig({
            type: 'SET_EDITOR_CONFIG_SETTINGS',
            payload: {
              isMinifyEnabled: data.isMinifyEnabled ?? false,
              isWordWrapEnabled: data.isWordWrapEnabled ?? false,
              isPreventThreadingEnabled: data.isPreventThreadingEnabled ?? false,
              activeEditor: data.activeEditor ?? '',
              hideWorkingFiles: data.hideWorkingFiles ?? true,
            },
          })

          // Update email settings
          dispatchEmail({
            type: 'SET_EMAIL_SETTINGS',
            payload: {
              subject: data.subject ?? '',
              emailAddresses: data.emailAddresses ?? [],
              host: data.host ?? '',
              port: data.port ?? '',
              username: data.username ?? '',
              pass: data.pass ?? '',
              from: data.from ?? '',
            },
          })
        }
      },
      (error) => {
        logError('An error occurred while fetching app context data', 'AppContext', error)
      }
    )

    return () => unsubscribe()
  }, [user, dispatchTheme, dispatchEditorConfig, dispatchEmail])

  return null
}

// Auth Provider Component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        setLoading(true)
      } else {
        setLoading(false)
        setError(null)
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
      <FirestoreSync user={user} />
    </AuthContext.Provider>
  )
}

// Composed App Provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <EditorSettingsProvider>
        <EmailProvider>
          <AuthProvider>{children}</AuthProvider>
        </EmailProvider>
      </EditorSettingsProvider>
    </ThemeProvider>
  )
}

// Hook to access Auth context
export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AppProvider')
  }
  return context
}

// Convenience hook for backward compatibility - provides merged settings object
export const useAppContext = () => {
  const auth = useAuthContext()
  const theme = useThemeContext()
  const editorConfig = useEditorSettingsContext()
  const email = useEmailContext()

  // Create merged settings object for backward compatibility
  const settings = {
    ...theme.themeSettings,
    ...editorConfig.editorConfigSettings,
    ...email.emailSettings,
  }

  // Create merged dispatch function
  const dispatch = (action: any) => {
    // Route dispatch to appropriate context based on action
    if (action.type === 'UPDATE_SETTING' || action.type === 'SET_SETTINGS' || action.type === 'RESET_SETTINGS') {
      const key = action.key || Object.keys(action.payload || {})[0]

      // Theme settings
      if (key === 'isDarkMode' || key === 'isPreviewDarkMode' || key === 'appColorScheme') {
        theme.dispatchTheme(action)
      }
      // Editor config settings
      else if (
        key === 'isMinifyEnabled' ||
        key === 'isWordWrapEnabled' ||
        key === 'isPreventThreadingEnabled' ||
        key === 'activeEditor' ||
        key === 'hideWorkingFiles'
      ) {
        editorConfig.dispatchEditorConfig(action)
      }
      // Email settings
      else if (
        key === 'subject' ||
        key === 'emailAddresses' ||
        key === 'host' ||
        key === 'port' ||
        key === 'username' ||
        key === 'pass' ||
        key === 'from'
      ) {
        email.dispatchEmail(action)
      }
      // If SET_SETTINGS or RESET_SETTINGS with multiple keys, dispatch to all
      else if (action.type === 'SET_SETTINGS' || action.type === 'RESET_SETTINGS') {
        theme.dispatchTheme(action)
        editorConfig.dispatchEditorConfig(action)
        email.dispatchEmail(action)
      }
    }
  }

  return {
    settings,
    dispatch,
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
  }
}
