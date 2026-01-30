import styled from '@emotion/styled'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Tooltip } from '@mui/material'
import { useRef } from 'react'

import { useEditorContext } from '../context/EditorContext'
import { useFirestoreSettings } from '../hooks/useFirestoreSettings'
import { BTN_UPLOAD_LABEL } from '../utils/constants'
import { createNewFile } from '../utils/createNewFile'
import { logError } from '../utils/logError'

import { StyledIconButton } from './StyledIconButton'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

const InputFileUpload = () => {
  const { setHtml, setText, setAmp, setWorkingFileID, setWorkingFileName, setIsFileLocked } = useEditorContext()
  const { updateMultipleSettings } = useFirestoreSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateMultipleSettings({ isMinifyEnabled: false, isWordWrapEnabled: false }, 'InputFileUpload')

    const file = e.target.files?.[0]

    if (!file) {
      logError('No file selected or file is invalid', 'InputFileUpload')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const options = {
      method: 'POST',
      body: formData,
    }

    const response = await fetch('/api/upload', options)

    if (!response.ok) {
      logError('File upload failed with status ' + response.status, 'InputFileUpload')
    }

    const text = await response.text()

    if (!text) {
      logError('Empty response body from file upload', 'InputFileUpload')
    }

    const isBoilerplateApplied = true
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    const boilerPlateMarkup = JSON.parse(text)

    await createNewFile(
      fileName,
      boilerPlateMarkup,
      isBoilerplateApplied,
      setWorkingFileID,
      setWorkingFileName,
      setHtml,
      setText,
      setAmp,
      setIsFileLocked
    )
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <>
      <Tooltip title={BTN_UPLOAD_LABEL} arrow enterDelay={1000}>
        <StyledIconButton onClick={handleButtonClick} aria-label={BTN_UPLOAD_LABEL}>
          <CloudUploadIcon />
        </StyledIconButton>
      </Tooltip>

      <VisuallyHiddenInput ref={fileInputRef} type='file' accept='.eml' tabIndex={-1} onChange={(e) => handleFileUpload(e)} />
    </>
  )
}

export default InputFileUpload
