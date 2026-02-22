/* eslint-disable react-refresh/only-export-components */
import { doc, onSnapshot } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { db } from '../firebase'
import { EditorConfigContextProps } from '../interfaces'
import { FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS } from '../utils/constants'
import { logError } from '../utils/logError'

import { useAuthContext } from './AuthContext'

const EditorConfigContext = createContext<EditorConfigContextProps | undefined>(undefined)

export const EditorConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext()

  const [isMinifyEnabled, setIsMinifyEnabled] = useState(false)
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(false)
  const [isPreventThreadingEnabled, setIsPreventThreadingEnabled] = useState(false)
  const [hideWorkingFiles, setHideWorkingFiles] = useState<boolean>(true)
  const [activeEditor, setActiveEditor] = useState('')

  useEffect(() => {
    if (!user) return

    const editorSettings = doc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS)
    const unsubscribe = onSnapshot(
      editorSettings,
      (doc) => {
        const data = doc.data()
        if (data) {
          const {
            isMinifyEnabled = false,
            isWordWrapEnabled = false,
            isPreventThreadingEnabled = false,
            activeEditor = '',
            hideWorkingFiles = true,
          } = data
          setIsMinifyEnabled((prev) => (prev === isMinifyEnabled ? prev : isMinifyEnabled))
          setIsWordWrapEnabled((prev) => (prev === isWordWrapEnabled ? prev : isWordWrapEnabled))
          setIsPreventThreadingEnabled((prev) => (prev === isPreventThreadingEnabled ? prev : isPreventThreadingEnabled))
          setHideWorkingFiles((prev) => (prev === hideWorkingFiles ? prev : hideWorkingFiles))
          setActiveEditor((prev) => (prev === activeEditor ? prev : activeEditor))
        }
      },
      (error) => {
        logError('An error occurred while fetching editor config data', 'EditorConfigContext', error)
      }
    )

    return () => {
      unsubscribe()
      setIsMinifyEnabled(false)
      setIsWordWrapEnabled(false)
      setIsPreventThreadingEnabled(false)
      setHideWorkingFiles(true)
      setActiveEditor('')
    }
  }, [user])

  const value = useMemo<EditorConfigContextProps>(
    () => ({
      isMinifyEnabled,
      setIsMinifyEnabled,
      isWordWrapEnabled,
      setIsWordWrapEnabled,
      isPreventThreadingEnabled,
      setIsPreventThreadingEnabled,
      activeEditor,
      setActiveEditor,
      hideWorkingFiles,
      setHideWorkingFiles,
    }),
    [isMinifyEnabled, isWordWrapEnabled, isPreventThreadingEnabled, activeEditor, hideWorkingFiles]
  )

  return <EditorConfigContext.Provider value={value}>{children}</EditorConfigContext.Provider>
}

export const useEditorConfigContext = (): EditorConfigContextProps => {
  const context = useContext(EditorConfigContext)
  if (context === undefined) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('useEditorConfigContext must be used within an EditorConfigProvider')
    } else {
      throw new Error('Editor config context is not available.')
    }
  }
  return context
}
