import { render } from '@testing-library/react'
import { describe, it, vi } from 'vitest'

import App from './App'
import { AppProvider } from './context/AppContext'

vi.mock('./context/AuthContext', () => ({
  useAuthContext: () => ({ user: null }),
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
