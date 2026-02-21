import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Tooltip } from '@mui/material'

import { useThemeSettingsContext } from '../context/ThemeSettingsContext'
import { db } from '../firebase'
import {
  FIRESTORE_COLLECTION_CONFIG,
  FIRESTORE_DOCUMENT_EDITOR_SETTINGS,
  TOGGLE_BTN_PREVIEW_DARK_MODE,
  TOGGLE_BTN_PREVIEW_LIGHT_MODE,
} from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import { StyledIconButton } from './StyledIconButton'

const InputTogglePreviewTheme = () => {
  const { isPreviewDarkMode, setIsPreviewDarkMode } = useThemeSettingsContext()

  const handleOpen = async () => {
    try {
      const firestoreObj = { isPreviewDarkMode: !isPreviewDarkMode }
      await updateFirestoreDoc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, firestoreObj)
      setIsPreviewDarkMode(!isPreviewDarkMode)
    } catch (error) {
      logError('Failed to toggle preview theme:', 'InputTogglePreviewTheme', error)
    }
  }

  const handleToggleButtonLabel = isPreviewDarkMode ? TOGGLE_BTN_PREVIEW_LIGHT_MODE : TOGGLE_BTN_PREVIEW_DARK_MODE

  return (
    <>
      <Tooltip title={handleToggleButtonLabel}>
        <StyledIconButton onClick={handleOpen} aria-label={handleToggleButtonLabel}>
          <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
          {isPreviewDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </StyledIconButton>
      </Tooltip>
    </>
  )
}
export default InputTogglePreviewTheme
