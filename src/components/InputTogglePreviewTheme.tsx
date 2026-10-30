import { useThemeSettingsContext } from '../context/ThemeSettingsContext'
import { db } from '../firebase'
import { FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, SETTINGS_PREVIEW_THEME_LABEL } from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import ThemeSelector from './ThemeSelector'

import type { ThemeMode } from '../interfaces'

const InputTogglePreviewTheme = () => {
  const { isPreviewDarkMode, setIsPreviewDarkMode } = useThemeSettingsContext()

  const handleChange = async (value: ThemeMode) => {
    const isNextDarkMode = value === 'dark'
    try {
      const firestoreObj = { isPreviewDarkMode: isNextDarkMode }
      await updateFirestoreDoc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, firestoreObj)
      setIsPreviewDarkMode(isNextDarkMode)
    } catch (error) {
      logError('Failed to toggle preview theme:', 'InputTogglePreviewTheme', error)
    }
  }

  return (
    <ThemeSelector id='preview-theme' label={SETTINGS_PREVIEW_THEME_LABEL} value={isPreviewDarkMode ? 'dark' : 'light'} onChange={handleChange} />
  )
}
export default InputTogglePreviewTheme
