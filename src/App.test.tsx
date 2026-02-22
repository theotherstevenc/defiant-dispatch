import { render } from '@testing-library/react'
import { describe, it, vi } from 'vitest'

import App from './App'
import { EditorConfigProvider } from './context/EditorConfigContext'

vi.mock('./context/AuthContext', () => ({
  useAuthContext: () => ({ user: null }),
}))

vi.mock('./context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: () => ({
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    isPreviewDarkMode: false,
    setIsPreviewDarkMode: vi.fn(),
    appColorScheme: '',
    setAppColorScheme: vi.fn(),
  }),
}))

vi.mock('./context/EmailSettingsContext', () => ({
  useEmailSettingsContext: () => ({
    subject: '',
    setSubject: vi.fn(),
    emailAddresses: [],
    setEmailAddresses: vi.fn(),
    inputSenderSettings: { host: '', port: '', username: '', pass: '', from: '' },
    setInputSenderSettings: vi.fn(),
  }),
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <EditorConfigProvider>
        <App />
      </EditorConfigProvider>
    )
  })
})
