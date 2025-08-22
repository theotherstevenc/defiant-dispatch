/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { AppContextProps, SenderSettings } from '../interfaces'
import { logError } from '../utils/logError'

const AppContext = createContext<AppContextProps | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
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
      return
    }

    const editorSettings = doc(db, 'config', 'editorSettings')
    const unsubscribe = onSnapshot(
      editorSettings,
      (doc) => {
        const data = doc.data()
        if (data) {
          const {
            subject,
            host,
            port,
            username,
            pass,
            from,
            isMinifyEnabled,
            isWordWrapEnabled,
            isPreventThreadingEnabled,
            activeEditor,
            emailAddresses,
            hideWorkingFiles,
            isDarkMode,
            isPreviewDarkMode,
            appColorScheme,
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

    return () => unsubscribe()
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
