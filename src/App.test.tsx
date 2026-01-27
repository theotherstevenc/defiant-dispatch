import { render } from '@testing-library/react'
import { describe, it } from 'vitest'

import App from './App'
import { AppProvider } from './context/AppContext'

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    )
  })
})
