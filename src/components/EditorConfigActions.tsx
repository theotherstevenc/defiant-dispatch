import { Box } from '@mui/material'

import {
  Authenticator,
  FontSizeControls,
  InputCreateNewFile,
  InputDeleteFile,
  InputFileUpload,
  InputFormatHTML,
  InputLockFile,
  InputMarkupSettings,
  InputSenderSettings,
  InputThemeToggle,
  InputToggleEditorTheme,
  InputTogglePreviewTheme,
  InputToggleWorkingFiles,
  InputUpdateFiles,
} from '../components'
import { inputActionsStyles, inputConfigStyles, inputSenderSettingsStyles } from '../styles/global.styles'

const EditorConfigActions = () => (
  <Box sx={inputConfigStyles}>
    <Box>
      <InputMarkupSettings />
    </Box>
    <Box sx={inputSenderSettingsStyles}>
      <InputSenderSettings />
    </Box>
    <Box sx={inputActionsStyles}>
      <InputThemeToggle />
      <InputToggleEditorTheme />
      <InputTogglePreviewTheme />
      <InputFormatHTML />
      <FontSizeControls />
      <InputLockFile />
      <InputToggleWorkingFiles />
      <InputCreateNewFile />
      <InputUpdateFiles />
      <InputDeleteFile />
      <InputFileUpload />
      <Authenticator />
    </Box>
  </Box>
)

export default EditorConfigActions
