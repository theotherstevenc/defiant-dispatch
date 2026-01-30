import CodeIcon from '@mui/icons-material/Code'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { Tooltip } from '@mui/material'

import { useAppContext } from '../context/AppContext'
import { db } from '../firebase'
import { TOGGLE_BTN_EDITOR_DARK_MODE, TOGGLE_BTN_EDITOR_LIGHT_MODE } from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import { StyledIconButton } from './StyledIconButton'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

const InputToggleEditorTheme = () => {
  const { settings, dispatch } = useAppContext()

  const handleOpen = async () => {
    try {
      const newValue = !settings.isDarkMode
      const firestoreObj = { isDarkMode: newValue }
      dispatch({ type: 'UPDATE_SETTING', key: 'isDarkMode', value: newValue })
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
    } catch (error) {
      logError('Failed to toggle editor theme:', 'InputToggleEditorTheme', error)
    }
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
