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

const CONFIG_SECTIONS = [
  {
    key: 'markup',
    sx: undefined,
    components: [InputMarkupSettings],
  },
  {
    key: 'sender',
    sx: inputSenderSettingsStyles,
    components: [InputSenderSettings],
  },
  {
    key: 'actions',
    sx: inputActionsStyles,
    components: [
      InputThemeToggle,
      InputToggleEditorTheme,
      InputTogglePreviewTheme,
      InputFormatHTML,
      FontSizeControls,
      InputLockFile,
      InputToggleWorkingFiles,
      InputCreateNewFile,
      InputUpdateFiles,
      InputDeleteFile,
      InputFileUpload,
      Authenticator,
    ],
  },
] as const

const EditorConfigActions = () => (
  <Box sx={inputConfigStyles}>
    {CONFIG_SECTIONS.map(({ key, sx, components: Components }) => (
      <Box key={key} sx={sx}>
        {Components.map((Component, i) => (
          <Component key={`${key}-${i}`} />
        ))}
      </Box>
    ))}
  </Box>
)

export default EditorConfigActions
