import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, Divider, Drawer, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'

import { settingsDrawerStyles } from '../styles/global.styles'
import {
  LABEL_CLOSE,
  SETTINGS_APPEARANCE_LABEL,
  SETTINGS_AUTOSAVE_LABEL,
  SETTINGS_EDITOR_LABEL,
  SETTINGS_FONT_SIZE_LABEL,
  SETTINGS_SENDING_LABEL,
  TOOLBAR_SETTINGS_LABEL,
} from '../utils/constants'

import FontSizeControls from './FontSizeControls'
import InputMarkupSettings from './InputMarkupSettings'
import InputSenderSettings from './InputSenderSettings'
import InputThemeToggle from './InputThemeToggle'
import InputToggleEditorTheme from './InputToggleEditorTheme'
import InputTogglePreviewTheme from './InputTogglePreviewTheme'
import { StyledIconButton } from './StyledIconButton'

import type { ReactElement } from 'react'

const EditorSettingsDrawer = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const handleClose = () => setIsOpen(false)

  return (
    <>
      <Tooltip title={TOOLBAR_SETTINGS_LABEL} placement='top' disableInteractive>
        <StyledIconButton
          aria-label={TOOLBAR_SETTINGS_LABEL}
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          aria-controls={isOpen ? 'editor-settings' : undefined}
          onClick={() => setIsOpen(true)}>
          <SettingsIcon />
        </StyledIconButton>
      </Tooltip>
      <Drawer
        anchor='right'
        open={isOpen}
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: { id: 'editor-settings', role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'editor-settings-title', sx: settingsDrawerStyles },
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, flexShrink: 0 }}>
          <Typography id='editor-settings-title' component='h2' variant='h6'>
            {TOOLBAR_SETTINGS_LABEL}
          </Typography>
          <IconButton aria-label={LABEL_CLOSE} onClick={handleClose} sx={{ minWidth: 44, minHeight: 44 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Stack spacing={3} divider={<Divider />} sx={{ p: 2, overflowY: 'auto', minHeight: 0 }}>
          <Stack component='section' aria-labelledby='editor-settings-heading' spacing={1}>
            <Typography id='editor-settings-heading' component='h3' variant='subtitle1'>
              {SETTINGS_EDITOR_LABEL}
            </Typography>
            <InputMarkupSettings section='editor' />
            <Typography component='h4' variant='body2'>
              {SETTINGS_FONT_SIZE_LABEL}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FontSizeControls />
            </Box>
          </Stack>
          <Stack component='section' aria-labelledby='sending-settings-heading' spacing={2}>
            <Typography id='sending-settings-heading' component='h3' variant='subtitle1'>
              {SETTINGS_SENDING_LABEL}
            </Typography>
            <InputMarkupSettings section='sending' />
            <InputSenderSettings />
          </Stack>
          <Stack component='section' aria-labelledby='appearance-settings-heading' spacing={2}>
            <Typography id='appearance-settings-heading' component='h3' variant='subtitle1'>
              {SETTINGS_APPEARANCE_LABEL}
            </Typography>
            <InputThemeToggle />
            <InputToggleEditorTheme />
            <InputTogglePreviewTheme />
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            {SETTINGS_AUTOSAVE_LABEL}
          </Typography>
        </Stack>
      </Drawer>
    </>
  )
}

export default EditorSettingsDrawer
