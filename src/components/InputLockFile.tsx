import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { Tooltip } from '@mui/material'

import { useEditorContext } from '../context/EditorContext'
import { updateWorkingFile } from '../services/workingFilesService'
import { INPUT_LOCK_FILE_LABEL_LOCK, INPUT_LOCK_FILE_LABEL_UNLOCK } from '../utils/constants'
import { logError } from '../utils/logError'

import { StyledIconButton } from './StyledIconButton'

const InputLockFile = () => {
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
      <Tooltip title={handleInputLockLabel}>
        <StyledIconButton onClick={handleClick} aria-label={handleInputLockLabel}>
          {isFileLocked ? <LockIcon /> : <LockOpenIcon />}
        </StyledIconButton>
      </Tooltip>
    </>
  )
}
export default InputLockFile
