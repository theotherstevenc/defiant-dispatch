/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer } from 'react'

export interface EmailSettings {
  subject: string
  emailAddresses: string[]
  host: string
  port: string
  username: string
  pass: string
  from: string
}

export type EmailAction =
  | { type: 'SET_EMAIL_SETTINGS'; payload: Partial<EmailSettings> }
  | { type: 'UPDATE_EMAIL_SETTING'; key: keyof EmailSettings; value: EmailSettings[keyof EmailSettings] }
  | { type: 'RESET_EMAIL_SETTINGS' }

export interface EmailContextProps {
  emailSettings: EmailSettings
  dispatchEmail: React.Dispatch<EmailAction>
}

const EmailContext = createContext<EmailContextProps | undefined>(undefined)

const initialEmailSettings: EmailSettings = {
  subject: '',
  emailAddresses: [],
  host: '',
  port: '',
  username: '',
  pass: '',
  from: '',
}

function emailSettingsReducer(state: EmailSettings, action: EmailAction): EmailSettings {
  switch (action.type) {
    case 'SET_EMAIL_SETTINGS':
      return { ...state, ...action.payload }
    case 'UPDATE_EMAIL_SETTING':
      return { ...state, [action.key]: action.value }
    case 'RESET_EMAIL_SETTINGS':
      return initialEmailSettings
    default:
      return state
  }
}

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emailSettings, dispatchEmail] = useReducer(emailSettingsReducer, initialEmailSettings)

  return <EmailContext.Provider value={{ emailSettings, dispatchEmail }}>{children}</EmailContext.Provider>
}

export const useEmailContext = (): EmailContextProps => {
  const context = useContext(EmailContext)
  if (context === undefined) {
    throw new Error('useEmailContext must be used within an EmailProvider')
  }
  return context
}
