import CodeIcon from '@mui/icons-material/Code'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { Button } from '@mui/material'

import { useThemeSettingsContext } from '../context/ThemeSettingsContext'
import { db } from '../firebase'
import {
  FIRESTORE_COLLECTION_CONFIG,
  FIRESTORE_DOCUMENT_EDITOR_SETTINGS,
  TOGGLE_BTN_EDITOR_DARK_MODE,
  TOGGLE_BTN_EDITOR_LIGHT_MODE,
} from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

const InputToggleEditorTheme = () => {
  const { isDarkMode, setIsDarkMode } = useThemeSettingsContext()

  const handleOpen = async () => {
    try {
      const firestoreObj = { isDarkMode: !isDarkMode }
      await updateFirestoreDoc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, firestoreObj)
      setIsDarkMode(!isDarkMode)
    } catch (error) {
      logError('Failed to toggle editor theme:', 'InputToggleEditorTheme', error)
    }
  }

  const handleToggleButtonLabel = isDarkMode ? TOGGLE_BTN_EDITOR_LIGHT_MODE : TOGGLE_BTN_EDITOR_DARK_MODE

  return (
    <>
      <Button onClick={handleOpen} aria-label={handleToggleButtonLabel} startIcon={<CodeIcon />} sx={{ minHeight: 44, justifyContent: 'flex-start' }}>
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        {handleToggleButtonLabel}
      </Button>
    </>
  )
}
export default InputToggleEditorTheme
