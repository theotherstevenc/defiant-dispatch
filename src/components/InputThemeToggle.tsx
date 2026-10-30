import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'

import { useThemeSettingsContext } from '../context/ThemeSettingsContext'
import { db } from '../firebase'
import {
  FIRESTORE_COLLECTION_CONFIG,
  FIRESTORE_DOCUMENT_EDITOR_SETTINGS,
  SETTINGS_APP_THEME_LABEL,
  SETTINGS_THEME_DARK_LABEL,
  SETTINGS_THEME_LIGHT_LABEL,
  SETTINGS_THEME_SYSTEM_LABEL,
} from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

const InputThemeToggle = () => {
  const { appColorScheme, setAppColorScheme } = useThemeSettingsContext()

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const firestoreObj = { appColorScheme: event.target.value }
      await updateFirestoreDoc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, firestoreObj)
      setAppColorScheme(event.target.value)
    } catch (error) {
      logError('Failed to update editor color scheme:', 'InputThemeToggle', error)
    }
  }

  return (
    <FormControl>
      <FormLabel id='app-theme-label'>{SETTINGS_APP_THEME_LABEL}</FormLabel>
      <RadioGroup row value={appColorScheme || 'system'} onChange={handleChange} aria-labelledby='app-theme-label' name='theme-mode'>
        <FormControlLabel
          value='light'
          control={<Radio icon={<LightModeIcon />} checkedIcon={<LightModeIcon />} />}
          label={SETTINGS_THEME_LIGHT_LABEL}
          sx={{ minHeight: 44 }}
        />
        <FormControlLabel
          value='system'
          control={<Radio icon={<SettingsSystemDaydreamIcon />} checkedIcon={<SettingsSystemDaydreamIcon />} />}
          label={SETTINGS_THEME_SYSTEM_LABEL}
          sx={{ minHeight: 44 }}
        />
        <FormControlLabel
          value='dark'
          control={<Radio icon={<DarkModeIcon />} checkedIcon={<DarkModeIcon />} />}
          label={SETTINGS_THEME_DARK_LABEL}
          sx={{ minHeight: 44 }}
        />
      </RadioGroup>
    </FormControl>
  )
}

export default InputThemeToggle
