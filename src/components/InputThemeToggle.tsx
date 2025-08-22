import { db } from '../firebase'
import { useAppContext } from '../context/AppContext'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'
import { logError } from '../utils/logError'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

const InputThemeToggle = () => {
  const { appColorScheme, setAppColorScheme } = useAppContext()

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const firestoreObj = { appColorScheme: event.target.value }
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
      setAppColorScheme(event.target.value)
    } catch (error) {
      logError('Failed to update editor color scheme:', 'InputThemeToggle', error)
    }
  }

  return (
    <RadioGroup
      row
      value={appColorScheme || 'system'}
      onChange={handleChange}
      aria-label='theme mode'
      name='theme-mode'>
      <FormControlLabel
        value='light'
        control={<Radio icon={<LightModeIcon />} checkedIcon={<LightModeIcon />} />}
        label=''
      />
      <FormControlLabel
        value='system'
        control={<Radio icon={<SettingsSystemDaydreamIcon />} checkedIcon={<SettingsSystemDaydreamIcon />} />}
        label=''
      />
      <FormControlLabel
        value='dark'
        control={<Radio icon={<DarkModeIcon />} checkedIcon={<DarkModeIcon />} />}
        label=''
      />
    </RadioGroup>
  )
}

export default InputThemeToggle
