import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { EditorConfigProvider } from './context/EditorConfigContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { EmailSettingsProvider } from './context/EmailSettingsContext.tsx'
import { ThemeSettingsProvider } from './context/ThemeSettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <EditorConfigProvider>
      <EmailSettingsProvider>
        <ThemeSettingsProvider>
          <App />
        </ThemeSettingsProvider>
      </EmailSettingsProvider>
    </EditorConfigProvider>
  </AuthProvider>
)
