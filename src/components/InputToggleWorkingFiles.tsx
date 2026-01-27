import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import { Tooltip } from '@mui/material'
import { useHotkeys } from 'react-hotkeys-hook'

import { useAppContext } from '../context/AppContext'
import { db } from '../firebase'
import { TOGGLE_BTN_HIDE_PROJECTS, TOGGLE_BTN_SHOW_PROJECTS } from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import { StyledIconButton } from './StyledIconButton'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

const InputToggleWorkingFiles = () => {
  const { hideWorkingFiles, setHideWorkingFiles } = useAppContext()

  const handleOpen = async () => {
    try {
      const firestoreObj = { hideWorkingFiles: !hideWorkingFiles }
      setHideWorkingFiles(!hideWorkingFiles)
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
    } catch (error) {
      logError('Error updating Firestore document', 'InputToggleWorkingFiles', error)
    }
  }

  useHotkeys('mod+b', () => handleOpen(), {
    enableOnFormTags: true,
    preventDefault: true,
  })

  const handleToggleButtonLabel = hideWorkingFiles ? TOGGLE_BTN_SHOW_PROJECTS : TOGGLE_BTN_HIDE_PROJECTS

  return (
    <>
      <Tooltip title={handleToggleButtonLabel}>
        <StyledIconButton onClick={handleOpen} aria-label={handleToggleButtonLabel}>
          {hideWorkingFiles ? <ToggleOffIcon /> : <ToggleOnIcon />}
        </StyledIconButton>
      </Tooltip>
    </>
  )
}
export default InputToggleWorkingFiles
