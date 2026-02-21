import { render } from '@testing-library/react'
import { describe, it, vi } from 'vitest'

import App from './App'
import { AppProvider } from './context/AppContext'

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

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    )
  })
})
