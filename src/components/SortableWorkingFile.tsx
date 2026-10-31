import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Button, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material'
import { useId, useState } from 'react'

import { workingFileAppearanceStyles, workingFileControlStyles, workingFileRowStyles, workingFileSelectStyles } from '../styles/global.styles'
import {
  BTN_VARIANT_CONTAINED,
  BTN_VARIANT_OUTLINED,
  WORKING_FILES_DRAG_LABEL,
  WORKING_FILES_LOCKED_LABEL,
  WORKING_FILES_MOVE_DOWN_LABEL,
  WORKING_FILES_MOVE_UP_LABEL,
} from '../utils/constants'

import type { WorkingFile } from '../interfaces'
import type { MouseEvent } from 'react'

interface SortableWorkingFileProps {
  file: WorkingFile
  index: number
  total: number
  isSelected: boolean
  canReorder: boolean
  onSelect: (file: WorkingFile) => void
  onMove: (id: string, destination: number) => Promise<void>
}

const SortableWorkingFile = ({ file, index, total, isSelected, canReorder, onSelect, onMove }: SortableWorkingFileProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const id = useId()
  const handleId = `${id}-handle`
  const menuId = `${id}-menu`
  const isMenuOpen = Boolean(anchorEl)
  const shouldReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging, isSorting } = useSortable({
    id: file.id,
    disabled: !canReorder,
    transition: shouldReduceMotion ? null : undefined,
  })
  const { onMouseDown, ...handleListeners } = listeners ?? {}
  const canMoveUp = canReorder && !isSorting && index > 0
  const canMoveDown = canReorder && !isSorting && index < total - 1
  const handleClose = () => setAnchorEl(null)
  const handleMove = (destination: number) => {
    handleClose()
    void onMove(file.id, destination)
  }
  const handleMouseDown = (event: MouseEvent<HTMLLIElement>) => {
    if (event.target instanceof Node && event.currentTarget.contains(event.target)) onMouseDown?.(event)
  }

  return (
    <Box
      component='li'
      ref={setNodeRef}
      onMouseDown={handleMouseDown}
      sx={[
        workingFileRowStyles,
        workingFileAppearanceStyles(isSelected),
        {
          cursor: canReorder ? (isDragging ? 'grabbing' : 'grab') : 'default',
        },
      ]}
      style={{
        transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
        transition,
        opacity: isDragging ? 0 : undefined,
      }}>
      <IconButton
        id={handleId}
        ref={setActivatorNodeRef}
        {...attributes}
        {...handleListeners}
        aria-label={`${WORKING_FILES_DRAG_LABEL} ${file.fileName}`}
        aria-haspopup='menu'
        aria-expanded={isMenuOpen}
        aria-controls={isMenuOpen ? menuId : undefined}
        onClick={(event) => {
          if (!canReorder || isSorting) return
          event.currentTarget.focus()
          setAnchorEl(event.currentTarget)
        }}
        sx={[
          workingFileControlStyles,
          {
            color: isSelected ? 'primary.contrastText' : 'text.secondary',
            touchAction: 'none',
            cursor: canReorder ? (isDragging ? 'grabbing' : 'grab') : 'default',
            '&:focus-visible': { outlineColor: isSelected ? 'primary.contrastText' : 'primary.main' },
          },
        ]}>
        <DragIndicatorIcon fontSize='small' />
      </IconButton>
      <Button
        variant={isSelected ? BTN_VARIANT_CONTAINED : BTN_VARIANT_OUTLINED}
        aria-pressed={isSelected}
        aria-label={file.isFileLocked ? `${file.fileName}, ${WORKING_FILES_LOCKED_LABEL}` : file.fileName}
        onClick={() => onSelect(file)}
        endIcon={file.isFileLocked ? <LockIcon fontSize='small' /> : undefined}
        sx={workingFileSelectStyles}>
        <Box component='span' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.fileName}
        </Box>
      </Button>
      <Menu id={menuId} anchorEl={anchorEl} open={isMenuOpen} onClose={handleClose} slotProps={{ list: { 'aria-labelledby': handleId } }}>
        <MenuItem
          aria-label={`${WORKING_FILES_MOVE_UP_LABEL} ${file.fileName}`}
          disabled={!canMoveUp}
          onClick={() => {
            if (canMoveUp) handleMove(index - 1)
          }}
          sx={{ minHeight: 44 }}>
          {WORKING_FILES_MOVE_UP_LABEL}
        </MenuItem>
        <MenuItem
          aria-label={`${WORKING_FILES_MOVE_DOWN_LABEL} ${file.fileName}`}
          disabled={!canMoveDown}
          onClick={() => {
            if (canMoveDown) handleMove(index + 1)
          }}
          sx={{ minHeight: 44 }}>
          {WORKING_FILES_MOVE_DOWN_LABEL}
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default SortableWorkingFile
