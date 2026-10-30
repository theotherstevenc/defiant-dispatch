import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import { useHotkeys } from 'react-hotkeys-hook'

import { useEditorConfigContext } from '../context/EditorConfigContext'
import { db } from '../firebase'
import {
  FIRESTORE_COLLECTION_CONFIG,
  FIRESTORE_DOCUMENT_EDITOR_SETTINGS,
  TOGGLE_BTN_HIDE_PROJECTS,
  TOGGLE_BTN_SHOW_PROJECTS,
} from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import EditorActionButton from './EditorActionButton'

import type { EditorActionProps } from '../interfaces'

const InputToggleWorkingFiles = (props: EditorActionProps) => {
  const { hideWorkingFiles, setHideWorkingFiles } = useEditorConfigContext()

  const handleOpen = async () => {
    try {
      const firestoreObj = { hideWorkingFiles: !hideWorkingFiles }
      setHideWorkingFiles(!hideWorkingFiles)
      await updateFirestoreDoc(db, FIRESTORE_COLLECTION_CONFIG, FIRESTORE_DOCUMENT_EDITOR_SETTINGS, firestoreObj)
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
      <EditorActionButton {...props} onClick={handleOpen} label={handleToggleButtonLabel} isSelected={!hideWorkingFiles}>
        {hideWorkingFiles ? <ToggleOffIcon /> : <ToggleOnIcon />}
      </EditorActionButton>
    </>
  )
}
export default InputToggleWorkingFiles
