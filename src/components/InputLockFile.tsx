import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'

import { useEditorContext } from '../context/EditorContext'
import { updateWorkingFile } from '../services/workingFilesService'
import { INPUT_LOCK_FILE_LABEL_LOCK, INPUT_LOCK_FILE_LABEL_UNLOCK } from '../utils/constants'
import { logError } from '../utils/logError'

import EditorActionButton from './EditorActionButton'

import type { EditorActionProps } from '../interfaces'

const InputLockFile = (props: EditorActionProps) => {
  const { workingFileID, isFileLocked, setIsFileLocked } = useEditorContext()

  const handleClick = async () => {
    try {
      const firestoreObj = { isFileLocked: !isFileLocked }
      await updateWorkingFile(workingFileID, firestoreObj)
      setIsFileLocked(!isFileLocked)
    } catch (error) {
      logError('Failed to toggle file lock:', 'InputLockFile', error)
    }
  }

  const handleInputLockLabel = isFileLocked ? INPUT_LOCK_FILE_LABEL_UNLOCK : INPUT_LOCK_FILE_LABEL_LOCK

  return (
    <>
      <EditorActionButton {...props} onClick={handleClick} label={handleInputLockLabel} isSelected={isFileLocked}>
        {isFileLocked ? <LockIcon /> : <LockOpenIcon />}
      </EditorActionButton>
    </>
  )
}
export default InputLockFile
