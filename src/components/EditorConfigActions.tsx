import { Box } from '@mui/material'

import { inputActionsStyles, inputConfigStyles, inputSenderSettingsStyles } from '../styles/global.styles'

import Authenticator from './Authenticator'
import FontSizeControls from './FontSizeControls'
import InputCreateNewFile from './InputCreateNewFile'
import InputDeleteFile from './InputDeleteFile'
import InputFileUpload from './InputFileUpload'
import InputFormatHTML from './InputFormatHTML'
import InputLockFile from './InputLockFile'
import InputMarkupSettings from './InputMarkupSettings'
import InputSenderSettings from './InputSenderSettings'
import InputThemeToggle from './InputThemeToggle'
import InputToggleEditorTheme from './InputToggleEditorTheme'
import InputTogglePreviewTheme from './InputTogglePreviewTheme'
import InputToggleWorkingFiles from './InputToggleWorkingFiles'
import InputUpdateFiles from './InputUpdateFiles'

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
