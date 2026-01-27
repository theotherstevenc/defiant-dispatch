import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Tooltip } from '@mui/material'
import { useState } from 'react'

import { useEditorContext } from '../context/EditorContext'
import { db } from '../firebase'
import { iconButtonStyles } from '../styles/global.styles'
import { BTN_LABEL_CANCEL, BTN_LABEL_OK, BTN_LABEL_UPDATE, BTN_LABEL_UPDATE_DIALOG, LABEL_CLOSE } from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import { StyledIconButton } from './StyledIconButton'

const InputUpdateFiles = () => {
  const { deletedWorkingFileID, workingFileID, workingFileName, setWorkingFileName, isFileLocked } = useEditorContext()
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleOpen = () => {
    if (isFileLocked || !workingFileID || workingFileID === deletedWorkingFileID) {
      return
    }
    setFileName(workingFileName)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setFileName('')
  }

  const COLLECTION = 'workingFiles'
  const DOCUMENT = workingFileID
  const firestoreObj = { fileName }

  const handleConfirm = async () => {
    if (!workingFileID) return

    if (fileName) {
      try {
        await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
        setWorkingFileName(fileName)
        handleClose()
      } catch (error) {
        logError('Failed to rename file:', 'InputUpdateFiles', error)
      }
    }
  }

  return (
    <>
      <Tooltip title={BTN_LABEL_UPDATE}>
        <StyledIconButton onClick={handleOpen} aria-label={BTN_LABEL_UPDATE}>
          <EditIcon />
        </StyledIconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>
          {BTN_LABEL_UPDATE}
          <IconButton aria-label={LABEL_CLOSE} onClick={handleClose} sx={iconButtonStyles}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label={BTN_LABEL_UPDATE_DIALOG}
            type='text'
            fullWidth
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleConfirm()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            {BTN_LABEL_CANCEL}
          </Button>
          <Button onClick={handleConfirm} color='primary'>
            {BTN_LABEL_OK}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default InputUpdateFiles
