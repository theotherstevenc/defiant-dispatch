import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, FormControlLabel, Checkbox } from '@mui/material'
import { useState } from 'react'

import { useEditorConfigContext } from '../context/EditorConfigContext'
import { useEditorContext } from '../context/EditorContext'
import { editorDialogPaperStyles, iconButtonStyles } from '../styles/global.styles'
import { boilerPlateMarkup } from '../utils/boilerPlateMarkup'
import { BTN_LABEL_CANCEL, BTN_LABEL_CREATE, BTN_LABEL_CREATE_CHECKBOX, BTN_LABEL_CREATE_DIALOG, BTN_LABEL_OK, LABEL_CLOSE } from '../utils/constants'
import { createNewFile } from '../utils/createNewFile'
import { logError } from '../utils/logError'

import EditorActionButton from './EditorActionButton'

import type { EditorActionProps } from '../interfaces'

const InputCreateNewFile = (props: EditorActionProps) => {
  const { setIsMinifyEnabled, setIsWordWrapEnabled } = useEditorConfigContext()
  const { setWorkingFileID, setWorkingFileName, setHtml, setText, setAmp, setIsFileLocked } = useEditorContext()
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const [isBoilerplateApplied, setIsBoilerplateApplied] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleChange = (_event: React.SyntheticEvent, checked: boolean) => {
    setIsBoilerplateApplied(checked)
  }

  const handleConfirm = async () => {
    setIsMinifyEnabled(false)
    setIsWordWrapEnabled(false)
    setWorkingFileID('')

    try {
      const result = await createNewFile({
        fileName,
        boilerPlateMarkup,
        isBoilerplateApplied,
      })

      if (result) {
        setWorkingFileID(result.id)
        setWorkingFileName(result.fileName)
        setHtml(result.html)
        setText(result.text)
        setAmp(result.amp)
        setIsFileLocked(result.isFileLocked)
      }
    } catch (error) {
      logError('Error creating new file', 'InputCreateNewFile', error)
    } finally {
      setFileName('')
      handleClose()
    }
  }

  return (
    <>
      <EditorActionButton {...props} onClick={handleOpen} label={BTN_LABEL_CREATE}>
        <AddIcon />
      </EditorActionButton>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm' slotProps={{ paper: { sx: editorDialogPaperStyles } }}>
        <DialogTitle>
          {BTN_LABEL_CREATE}
          <IconButton aria-label={LABEL_CLOSE} onClick={handleClose} sx={iconButtonStyles}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='normal'
            variant='filled'
            label={BTN_LABEL_CREATE_DIALOG}
            type='text'
            fullWidth
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleConfirm()
              }
            }}
          />
          <FormControlLabel
            control={<Checkbox name='isBoilerplateApplied' color='primary' />}
            label={BTN_LABEL_CREATE_CHECKBOX}
            checked={isBoilerplateApplied}
            onChange={handleChange}
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

export default InputCreateNewFile
