/* eslint-disable react-refresh/only-export-components */
import { doc, onSnapshot } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useState } from 'react'

import { db } from '../firebase'
import { AppContextProps, SenderSettings } from '../interfaces'
import { FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS } from '../utils/constants'
import { logError } from '../utils/logError'

import { useAuthContext } from './AuthContext'

const AppContext = createContext<AppContextProps | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext()

  const [appColorScheme, setAppColorScheme] = useState<string>('')
  const [isMinifyEnabled, setIsMinifyEnabled] = useState(false)
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(false)
  const [isPreventThreadingEnabled, setIsPreventThreadingEnabled] = useState(false)
  const [hideWorkingFiles, setHideWorkingFiles] = useState<boolean>(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isPreviewDarkMode, setIsPreviewDarkMode] = useState(false)
  const [activeEditor, setActiveEditor] = useState('')
  const [subject, setSubject] = useState<string>('')
  const [emailAddresses, setEmailAddresses] = useState<string[]>([])
  const [inputSenderSettings, setInputSenderSettings] = useState<SenderSettings>({
    host: '',
    port: '',
    username: '',
    pass: '',
    from: '',
  })

  useEffect(() => {
    if (!user) return

    const editorSettings = doc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS)
    const unsubscribe = onSnapshot(
      editorSettings,
      (doc) => {
        const data = doc.data()
        if (data) {
          const {
            subject = '',
            host = '',
            port = '',
            username = '',
            pass = '',
            from = '',
            isMinifyEnabled = false,
            isWordWrapEnabled = false,
            isPreventThreadingEnabled = false,
            activeEditor = '',
            emailAddresses = [],
            hideWorkingFiles = true,
            isDarkMode = false,
            isPreviewDarkMode = false,
            appColorScheme = '',
          } = data
          setAppColorScheme(appColorScheme)
          setSubject(subject)
          setIsMinifyEnabled(isMinifyEnabled)
          setIsWordWrapEnabled(isWordWrapEnabled)
          setIsPreventThreadingEnabled(isPreventThreadingEnabled)
          setIsDarkMode(isDarkMode)
          setIsPreviewDarkMode(isPreviewDarkMode)
          setHideWorkingFiles(hideWorkingFiles)
          setActiveEditor(activeEditor)
          setEmailAddresses(emailAddresses)
          setInputSenderSettings({ host, port, username, pass, from })
        }
      },
      (error) => {
        logError('An error occurred while fetching app context data', 'AppContext', error)
      }
    )

    return () => {
      unsubscribe()
      setSubject('')
      setIsMinifyEnabled(false)
      setIsWordWrapEnabled(false)
      setIsPreventThreadingEnabled(false)
      setIsDarkMode(false)
      setIsPreviewDarkMode(false)
      setAppColorScheme('')
      setHideWorkingFiles(true)
      setActiveEditor('')
      setEmailAddresses([])
      setInputSenderSettings({
        host: '',
        port: '',
        username: '',
        pass: '',
        from: '',
      })
    }
  }, [user])

  return (
    <AppContext.Provider
      value={{
        isMinifyEnabled,
        setIsMinifyEnabled,
        isWordWrapEnabled,
        setIsWordWrapEnabled,
        isPreventThreadingEnabled,
        setIsPreventThreadingEnabled,
        activeEditor,
        setActiveEditor,
        subject,
        setSubject,
        emailAddresses,
        setEmailAddresses,
        inputSenderSettings,
        setInputSenderSettings,
        hideWorkingFiles,
        setHideWorkingFiles,
        isDarkMode,
        setIsDarkMode,
        isPreviewDarkMode,
        setIsPreviewDarkMode,
        appColorScheme,
        setAppColorScheme,
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
