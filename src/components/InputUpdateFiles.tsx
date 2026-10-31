import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton } from '@mui/material'
import { useState } from 'react'

import { useEditorContext } from '../context/EditorContext'
import { updateWorkingFile } from '../services/workingFilesService'
import { editorDialogPaperStyles, iconButtonStyles } from '../styles/global.styles'
import { BTN_LABEL_CANCEL, BTN_LABEL_OK, BTN_LABEL_UPDATE, BTN_LABEL_UPDATE_DIALOG, LABEL_CLOSE } from '../utils/constants'
import { logError } from '../utils/logError'

import EditorActionButton from './EditorActionButton'

import type { EditorActionProps } from '../interfaces'

const InputUpdateFiles = (props: EditorActionProps) => {
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

  const handleConfirm = async () => {
    if (!workingFileID) return

    if (fileName) {
      try {
        const firestoreObj = { fileName }
        await updateWorkingFile(workingFileID, firestoreObj)
        setWorkingFileName(fileName)
      } catch (error) {
        logError('Failed to rename file:', 'InputUpdateFiles', error)
      } finally {
        handleClose()
      }
    }
  }

  return (
    <>
      <EditorActionButton {...props} onClick={handleOpen} label={BTN_LABEL_UPDATE}>
        <EditIcon />
      </EditorActionButton>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm' slotProps={{ paper: { sx: editorDialogPaperStyles } }}>
        <DialogTitle>
          {BTN_LABEL_UPDATE}
          <IconButton aria-label={LABEL_CLOSE} onClick={handleClose} sx={iconButtonStyles}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='normal'
            variant='filled'
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
          <Button onClick={handleConfirm} color='primary' variant='contained'>
            {BTN_LABEL_OK}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default InputUpdateFiles
