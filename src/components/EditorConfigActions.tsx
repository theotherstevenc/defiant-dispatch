import { Box, useMediaQuery, useTheme } from '@mui/material'

import {
  Authenticator,
  EditorFileMenu,
  EditorSettingsDrawer,
  EditorToolsMenu,
  InputFormatHTML,
  InputLockFile,
  InputToggleWorkingFiles,
} from '../components'
import { inputConfigStyles } from '../styles/global.styles'
import { TOOLBAR_LABEL } from '../utils/constants'

const EditorConfigActions = () => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box component='nav' aria-label={TOOLBAR_LABEL} sx={inputConfigStyles}>
      <EditorFileMenu />
      {isSmallScreen ? (
        <EditorToolsMenu />
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <InputFormatHTML />
          <InputLockFile />
          <InputToggleWorkingFiles />
        </Box>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <EditorSettingsDrawer />
      <Authenticator />
    </Box>
  )
}

export default EditorConfigActions
