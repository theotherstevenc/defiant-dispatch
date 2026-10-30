import { useThemeSettingsContext } from '../context/ThemeSettingsContext'
import { db } from '../firebase'
import { FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, SETTINGS_APP_THEME_LABEL } from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import ThemeSelector from './ThemeSelector'

import type { ThemeMode } from '../interfaces'

const InputThemeToggle = () => {
  const { appColorScheme, setAppColorScheme } = useThemeSettingsContext()

  const handleChange = async (value: ThemeMode) => {
    try {
      const firestoreObj = { appColorScheme: value }
      await updateFirestoreDoc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, firestoreObj)
      setAppColorScheme(value)
    } catch (error) {
      logError('Failed to update app theme:', 'InputThemeToggle', error)
    }
  }

  return <ThemeSelector id='app-theme' label={SETTINGS_APP_THEME_LABEL} value={appColorScheme || 'light'} hasSystemOption onChange={handleChange} />
}

export default InputThemeToggle
