import CodeIcon from '@mui/icons-material/Code'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { Tooltip } from '@mui/material'

import { useAppContext } from '../context/AppContext'
import { useFirestoreSettings } from '../hooks/useFirestoreSettings'
import { TOGGLE_BTN_EDITOR_DARK_MODE, TOGGLE_BTN_EDITOR_LIGHT_MODE } from '../utils/constants'

import { StyledIconButton } from './StyledIconButton'

const InputToggleEditorTheme = () => {
  const { settings } = useAppContext()
  const { updateSetting } = useFirestoreSettings()

  const handleOpen = async () => {
    const newValue = !settings.isDarkMode
    await updateSetting('isDarkMode', newValue, 'InputToggleEditorTheme')
  }

  const handleToggleButtonLabel = settings.isDarkMode ? TOGGLE_BTN_EDITOR_LIGHT_MODE : TOGGLE_BTN_EDITOR_DARK_MODE

  return (
    <>
      <Tooltip title={handleToggleButtonLabel}>
        <StyledIconButton onClick={handleOpen} aria-label={handleToggleButtonLabel}>
          <CodeIcon sx={{ fontSize: 16, mr: 0.5 }} />
          {settings.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </StyledIconButton>
      </Tooltip>
    </>
  )
}
export default InputToggleEditorTheme
