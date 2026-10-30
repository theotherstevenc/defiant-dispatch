import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button, Divider, Menu } from '@mui/material'
import { useState } from 'react'

import { toolbarButtonStyles } from '../styles/global.styles'
import { TOOLBAR_FILE_LABEL } from '../utils/constants'

import InputCreateNewFile from './InputCreateNewFile'
import InputDeleteFile from './InputDeleteFile'
import InputFileUpload from './InputFileUpload'
import InputUpdateFiles from './InputUpdateFiles'

import type { ReactElement } from 'react'

const EditorFileMenu = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isOpen = Boolean(anchorEl)
  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <Button
        id='editor-file-button'
        aria-label={TOOLBAR_FILE_LABEL}
        aria-haspopup='menu'
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'editor-file-menu' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        endIcon={<ExpandMoreIcon />}
        sx={toolbarButtonStyles}>
        {TOOLBAR_FILE_LABEL}
      </Button>
      <Menu
        id='editor-file-menu'
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        keepMounted
        slotProps={{ list: { 'aria-labelledby': 'editor-file-button' } }}>
        <InputCreateNewFile isMenuItem onAction={handleClose} />
        <InputUpdateFiles isMenuItem onAction={handleClose} />
        <InputFileUpload isMenuItem onAction={handleClose} />
        <Divider />
        <InputDeleteFile isMenuItem onAction={handleClose} />
      </Menu>
    </>
  )
}

export default EditorFileMenu
