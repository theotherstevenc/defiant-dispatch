import './App.css'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'

import { EditorContainer, EditorConfigActions, EditorContentDelivery } from './components'
import { EditorProvider } from './context/EditorContext'
import { editorWorkspaceStyles } from './styles/global.styles'
import { usePreferredTheme } from './utils/usePreferredTheme'

function App() {
  const theme = usePreferredTheme()

  return (
    <EditorProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ pt: 1, flexShrink: 0 }}>
          <EditorContentDelivery />
        </Box>
        <Box component='main' sx={editorWorkspaceStyles}>
          <EditorConfigActions />
          <EditorContainer />
        </Box>
      </ThemeProvider>
    </EditorProvider>
  )
}

export default App
