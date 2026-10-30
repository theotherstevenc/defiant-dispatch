import { useThemeSettingsContext } from '../context/ThemeSettingsContext'
import { db } from '../firebase'
import { FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, SETTINGS_EDITOR_THEME_LABEL } from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import ThemeSelector from './ThemeSelector'

import type { ThemeMode } from '../interfaces'

const InputToggleEditorTheme = () => {
  const { isDarkMode, setIsDarkMode } = useThemeSettingsContext()

  const handleChange = async (value: ThemeMode) => {
    const isNextDarkMode = value === 'dark'
    try {
      const firestoreObj = { isDarkMode: isNextDarkMode }
      await updateFirestoreDoc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, firestoreObj)
      setIsDarkMode(isNextDarkMode)
    } catch (error) {
      logError('Failed to toggle editor theme:', 'InputToggleEditorTheme', error)
    }
  }

  return <ThemeSelector id='editor-theme' label={SETTINGS_EDITOR_THEME_LABEL} value={isDarkMode ? 'dark' : 'light'} onChange={handleChange} />
}
export default InputToggleEditorTheme
