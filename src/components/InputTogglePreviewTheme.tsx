import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Tooltip } from '@mui/material'

import { useAppContext } from '../context/AppContext'
import { useFirestoreSettings } from '../hooks/useFirestoreSettings'
import { TOGGLE_BTN_PREVIEW_DARK_MODE, TOGGLE_BTN_PREVIEW_LIGHT_MODE } from '../utils/constants'

import { StyledIconButton } from './StyledIconButton'

const InputTogglePreviewTheme = () => {
  const { settings } = useAppContext()
  const { updateSetting } = useFirestoreSettings()

  const handleOpen = async () => {
    const newValue = !settings.isPreviewDarkMode
    await updateSetting('isPreviewDarkMode', newValue, 'InputTogglePreviewTheme')
  }

  const handleToggleButtonLabel = settings.isPreviewDarkMode ? TOGGLE_BTN_PREVIEW_LIGHT_MODE : TOGGLE_BTN_PREVIEW_DARK_MODE

  return (
    <>
      <Tooltip title={handleToggleButtonLabel}>
        <StyledIconButton onClick={handleOpen} aria-label={handleToggleButtonLabel}>
          <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
          {settings.isPreviewDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </StyledIconButton>
      </Tooltip>
    </>
  )
}
export default InputTogglePreviewTheme
