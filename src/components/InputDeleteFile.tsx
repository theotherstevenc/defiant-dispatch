import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material'
import { useState } from 'react'

import { useEditorContext } from '../context/EditorContext'
import { deleteWorkingFile } from '../services/workingFilesService'
import { iconButtonStyles } from '../styles/global.styles'
import {
  BTN_LABEL_CANCEL,
  BTN_LABEL_CONFIRM,
  BTN_LABEL_DELETE,
  BTN_LABEL_DELETE_CONFIRM,
  DIALOG_CANNOT_BE_UNDONE,
  LABEL_CLOSE,
} from '../utils/constants'
import { logError } from '../utils/logError'

import EditorActionButton from './EditorActionButton'

import type { EditorActionProps } from '../interfaces'

const InputDeleteFile = (props: EditorActionProps) => {
  const { deletedWorkingFileID, workingFileID, setHtml, setText, setAmp, workingFileName, setDeletedWorkingFileID, isFileLocked } = useEditorContext()
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    if (isFileLocked || !workingFileID || workingFileID === deletedWorkingFileID) {
      return
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDeleteFile = async () => {
    if (!workingFileID) {
      return
    }

    try {
      await deleteWorkingFile(workingFileID)

      setHtml('')
      setText('')
      setAmp('')
      setDeletedWorkingFileID(workingFileID)
    } catch (error) {
      logError('Error deleting file', 'InputDeleteFile', error)
    }

    handleClose()
  }

  return (
    <>
      <EditorActionButton {...props} onClick={handleOpen} label={BTN_LABEL_DELETE} isDestructive>
        <DeleteIcon />
      </EditorActionButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {BTN_LABEL_DELETE_CONFIRM}
          <IconButton aria-label={LABEL_CLOSE} onClick={handleClose} sx={iconButtonStyles}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{workingFileName}</strong> - {DIALOG_CANNOT_BE_UNDONE}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            {BTN_LABEL_CANCEL}
          </Button>
          <Button onClick={handleDeleteFile} color='primary' autoFocus>
            {BTN_LABEL_CONFIRM}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default InputDeleteFile
