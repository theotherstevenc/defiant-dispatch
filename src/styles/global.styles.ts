import { PREVIEW_DARK_MODE, PREVIEW_LIGHT_MODE } from '../utils/constants'

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
