import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { AppProvider } from './context/AppContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { EmailSettingsProvider } from './context/EmailSettingsContext.tsx'
import { ThemeSettingsProvider } from './context/ThemeSettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AppProvider>
      <EmailSettingsProvider>
        <ThemeSettingsProvider>
          <App />
        </ThemeSettingsProvider>
      </EmailSettingsProvider>
    </AppProvider>
  </AuthProvider>
)
