import { Box } from '@mui/material'

import { Authenticator, EditorFileMenu, EditorSettingsDrawer, InputFormatHTML, InputLockFile, InputToggleWorkingFiles } from '../components'
import { commandGroupStyles, inputConfigStyles, settingsGroupStyles } from '../styles/global.styles'
import { TOOLBAR_LABEL } from '../utils/constants'

const EditorConfigActions = () => (
  <Box component='nav' aria-label={TOOLBAR_LABEL} sx={inputConfigStyles}>
    <Box sx={commandGroupStyles}>
      <EditorFileMenu />
      <InputFormatHTML />
      <InputLockFile />
      <InputToggleWorkingFiles />
    </Box>
    <Box sx={settingsGroupStyles}>
      <EditorSettingsDrawer />
      <Authenticator />
    </Box>
  </Box>
)

export default EditorConfigActions
