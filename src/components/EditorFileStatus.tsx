import { Box, Typography } from '@mui/material'

import { useEditorContext } from '../context/EditorContext'
import { editorFileStatusStyles, fileStatusTextStyles } from '../styles/global.styles'
import { FILE_STATUS_EMPTY_LABEL } from '../utils/constants'

import type { ReactElement } from 'react'

const EditorFileStatus = (): ReactElement => {
  const { files, workingFileID } = useEditorContext()
  const activeFile = files.find((file) => file.id === workingFileID)

  return (
    <Box role='status' sx={editorFileStatusStyles}>
      <Typography component='span' variant='body2' sx={fileStatusTextStyles}>
        {activeFile ? activeFile.fileName : FILE_STATUS_EMPTY_LABEL}
      </Typography>
    </Box>
  )
}

export default EditorFileStatus
