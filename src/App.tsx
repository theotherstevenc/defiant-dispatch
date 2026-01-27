import './App.css'
import { CssBaseline, ThemeProvider } from '@mui/material'

import { EditorContainer, EditorConfigActions, EditorContentDelivery } from './components'
import { EditorProvider } from './context/EditorContext'
import { usePreferredTheme } from './utils/usePreferredTheme'

function App() {
  const theme = usePreferredTheme()

  return (
    <EditorProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EditorConfigActions />
        <EditorContentDelivery />
        <EditorContainer />
      </ThemeProvider>
    </EditorProvider>
  )
}

export default App
