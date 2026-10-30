import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Button } from '@mui/material'

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
      <Button
        onClick={handleOpen}
        aria-label={handleToggleButtonLabel}
        startIcon={<VisibilityIcon />}
        sx={{ minHeight: 44, justifyContent: 'flex-start' }}>
        {isPreviewDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        {handleToggleButtonLabel}
      </Button>
    </>
  )
}
export default InputTogglePreviewTheme
