import { PREVIEW_DARK_MODE, PREVIEW_LIGHT_MODE } from '../utils/constants'

import { EDITOR_SCROLLBAR_COLORS } from './global.theme'

import type { Theme } from '@mui/material/styles'

export const workingFilesPaneStyles = {
  display: 'flex',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
}

export const workingFilesScrollAreaStyles = (theme: Theme) => ({
  position: 'relative',
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  '& .working-files-scrollbar': {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 14,
    zIndex: 1,
    touchAction: 'none',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 800ms linear',
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: -2,
    },
  },
  '&:hover .working-files-scrollbar, &:focus-within .working-files-scrollbar, &[data-dragging="true"] .working-files-scrollbar': {
    opacity: 1,
    pointerEvents: 'auto',
    transition: 'opacity 100ms',
  },
  '& .working-files-scrollbar-thumb': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    bgcolor: EDITOR_SCROLLBAR_COLORS[theme.palette.mode].thumb,
    '&:hover': {
      bgcolor: EDITOR_SCROLLBAR_COLORS[theme.palette.mode].hover,
    },
  },
  '&[data-dragging="true"] .working-files-scrollbar-thumb': {
    bgcolor: EDITOR_SCROLLBAR_COLORS[theme.palette.mode].active,
  },
  '@media (hover: none), (pointer: coarse)': {
    '& .working-files-scrollbar': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& .working-files-scrollbar, &:hover .working-files-scrollbar, &:focus-within .working-files-scrollbar, &[data-dragging="true"] .working-files-scrollbar':
      {
        transition: 'none',
      },
  },
})

export const workingFilesViewportStyles = {
  height: '100%',
  overflowY: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}

export const workspacePreviewIframeStyles = (isDarkMode: boolean) => ({
  width: '100%',
  height: '100%',
  border: 'none',
  overflow: 'hidden',
  display: 'block',
  colorScheme: isDarkMode ? PREVIEW_DARK_MODE : PREVIEW_LIGHT_MODE,
})

export const workspaceEditorStyles = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}

export const editorWorkspaceStyles = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  '& > .split-component': {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
}

export const inputConfigStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  p: 1,
  pb: 'max(8px, env(safe-area-inset-bottom))',
  pl: 'max(8px, env(safe-area-inset-left))',
  pr: 'max(8px, env(safe-area-inset-right))',
  width: '100%',
  flexShrink: 0,
  overflow: 'auto',
  borderTop: 1,
  borderColor: 'divider',
  bgcolor: 'background.paper',
  '& .MuiIconButton-root': {
    bgcolor: 'transparent',
    color: 'text.secondary',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: 'action.hover',
      color: 'text.primary',
    },
    '&[aria-pressed="true"]': {
      bgcolor: 'action.selected',
      color: 'primary.main',
    },
  },
}

export const commandGroupStyles = {
  display: 'flex',
  flexDirection: 'row',
  gap: 0.5,
  flexShrink: 0,
}

export const settingsDrawerStyles = {
  width: { xs: '100%', sm: 400 },
  maxWidth: '100%',
  overflow: 'hidden',
}

export const themeOptionStyles = {
  flex: 1,
  minWidth: 0,
  minHeight: 44,
  m: 0,
  px: 0.5,
  justifyContent: 'center',
  border: 1,
  borderColor: 'divider',
  borderRadius: 1,
  '&:hover': { bgcolor: 'action.hover' },
  '&:focus-within': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
  '& .MuiFormControlLabel-label': { fontWeight: 'inherit', whiteSpace: 'nowrap' },
}

export const visuallyHiddenStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
}

export const workingFileRowStyles = (theme: Theme) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  border: 1,
  borderRadius: 1,
  '&:hover': {
    backgroundImage: `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
  },
})

export const workingFileSelectStyles = {
  flex: '1 1 0',
  minWidth: 0,
  minHeight: 44,
  maxWidth: '100%',
  paddingLeft: 0,
  justifyContent: 'flex-start',
  border: 0,
  borderRadius: 'inherit',
  bgcolor: 'transparent',
  color: 'inherit',
  boxShadow: 'none',
  '&:hover': {
    border: 0,
    bgcolor: 'transparent',
    boxShadow: 'none',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'currentColor',
    outlineOffset: -2,
  },
}

export const workingFileControlStyles = {
  width: 44,
  height: 44,
  flexShrink: 0,
  '&:hover': {
    bgcolor: 'transparent',
  },
  '&[aria-disabled="true"]': {
    color: 'action.disabled',
    cursor: 'default',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: -2,
  },
}

export const editorActionsStyles = {
  display: 'flex',
  gap: '0.175rem',
  margin: '0 0.5rem 0.5rem 0.5rem',
}

export const iconButtonStyles = {
  position: 'absolute',
  right: 8,
  top: 8,
}
