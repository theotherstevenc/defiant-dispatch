import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button, Menu } from '@mui/material'
import { useState } from 'react'

import { toolbarButtonStyles } from '../styles/global.styles'
import { TOOLBAR_TOOLS_LABEL } from '../utils/constants'

import InputFormatHTML from './InputFormatHTML'
import InputLockFile from './InputLockFile'
import InputToggleWorkingFiles from './InputToggleWorkingFiles'

import type { ReactElement } from 'react'

const EditorToolsMenu = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isOpen = Boolean(anchorEl)
  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <Button
        id='editor-tools-button'
        aria-label={TOOLBAR_TOOLS_LABEL}
        aria-haspopup='menu'
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'editor-tools-menu' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        endIcon={<ExpandMoreIcon />}
        sx={toolbarButtonStyles}>
        {TOOLBAR_TOOLS_LABEL}
      </Button>
      <Menu
        id='editor-tools-menu'
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        keepMounted
        slotProps={{ list: { 'aria-labelledby': 'editor-tools-button' } }}>
        <InputFormatHTML isMenuItem onAction={handleClose} />
        <InputLockFile isMenuItem onAction={handleClose} />
        <InputToggleWorkingFiles isMenuItem onAction={handleClose} />
      </Menu>
    </>
  )
}

export default EditorToolsMenu
