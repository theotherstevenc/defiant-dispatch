import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Button } from '@mui/material'

import {
  workingFileAppearanceStyles,
  workingFileControlStyles,
  workingFileDragHandleStyles,
  workingFileRowStyles,
  workingFileSelectStyles,
} from '../styles/global.styles'
import { BTN_VARIANT_CONTAINED, BTN_VARIANT_OUTLINED } from '../utils/constants'

import type { WorkingFile } from '../interfaces'

interface WorkingFileDragPreviewProps {
  file: WorkingFile
  isSelected: boolean
}

const WorkingFileDragPreview = ({ file, isSelected }: WorkingFileDragPreviewProps) => (
  <Box aria-hidden='true' sx={[workingFileRowStyles, workingFileAppearanceStyles(isSelected)]}>
    <Box sx={[workingFileControlStyles, workingFileDragHandleStyles, { color: isSelected ? 'primary.contrastText' : 'text.secondary' }]}>
      <DragIndicatorIcon fontSize='small' />
    </Box>
    <Button
      variant={isSelected ? BTN_VARIANT_CONTAINED : BTN_VARIANT_OUTLINED}
      tabIndex={-1}
      endIcon={file.isFileLocked ? <LockIcon fontSize='small' /> : undefined}
      sx={workingFileSelectStyles}>
      <Box component='span' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {file.fileName}
      </Box>
    </Button>
  </Box>
)

export default WorkingFileDragPreview
