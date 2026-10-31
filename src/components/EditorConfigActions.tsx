import { Box } from '@mui/material'

import {
  Authenticator,
  EditorFileMenu,
  EditorFileStatus,
  EditorSettingsDrawer,
  InputFormatHTML,
  InputLockFile,
  InputToggleWorkingFiles,
} from '../components'
import { commandGroupStyles, editorToolbarEndStyles, editorToolbarStartStyles, inputConfigStyles } from '../styles/global.styles'
import { TOOLBAR_LABEL } from '../utils/constants'

const EditorConfigActions = () => (
  <Box component='nav' aria-label={TOOLBAR_LABEL} sx={inputConfigStyles}>
    <Box sx={[commandGroupStyles, editorToolbarStartStyles]}>
      <EditorFileMenu />
      <InputFormatHTML />
      <InputLockFile />
      <InputToggleWorkingFiles />
    </Box>
    <EditorFileStatus />
    <Box sx={[commandGroupStyles, editorToolbarEndStyles]}>
      <EditorSettingsDrawer />
      <Authenticator />
    </Box>
  </Box>
)

export default EditorConfigActions
