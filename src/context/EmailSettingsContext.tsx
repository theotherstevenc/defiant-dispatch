/* eslint-disable react-refresh/only-export-components */
import { doc, onSnapshot } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { db } from '../firebase'
import { EmailSettingsContextProps, SenderSettings } from '../interfaces'
import { FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS } from '../utils/constants'
import { logError } from '../utils/logError'

import { useAuthContext } from './AuthContext'

const EmailSettingsContext = createContext<EmailSettingsContextProps | undefined>(undefined)

export const EmailSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext()

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
          const { subject = '', host = '', port = '', username = '', pass = '', from = '', emailAddresses = [] } = data

          setSubject((prev) => (prev === subject ? prev : subject))
          setEmailAddresses((prev) => {
            const next = emailAddresses as string[]
            return prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next
          })
          setInputSenderSettings((prev) => {
            const next = { host, port, username, pass, from }
            return prev.host === next.host &&
              prev.port === next.port &&
              prev.username === next.username &&
              prev.pass === next.pass &&
              prev.from === next.from
              ? prev
              : next
          })
        }
      },
      (error) => {
        logError('An error occurred while fetching email settings', 'EmailSettingsContext', error)
      }
    )

    return () => {
      unsubscribe()
      setSubject('')
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

  const value = useMemo<EmailSettingsContextProps>(
    () => ({
      subject,
      setSubject,
      emailAddresses,
      setEmailAddresses,
      inputSenderSettings,
      setInputSenderSettings,
    }),
    [subject, emailAddresses, inputSenderSettings]
  )

  return <EmailSettingsContext.Provider value={value}>{children}</EmailSettingsContext.Provider>
}

export const useEmailSettingsContext = (): EmailSettingsContextProps => {
  const context = useContext(EmailSettingsContext)
  if (context === undefined) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('useEmailSettingsContext must be used within an EmailSettingsProvider')
    } else {
      throw new Error('Email settings context is not available.')
    }
  }
  return context
}
