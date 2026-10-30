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
  flexDirection: { xs: 'column-reverse', sm: 'row' },
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
  flexDirection: { xs: 'row', sm: 'column' },
  alignItems: 'center',
  justifyContent: { xs: 'space-between', sm: 'flex-start' },
  gap: 1,
  p: 1,
  px: { xs: 1, sm: 0.75 },
  pb: { xs: 'max(8px, env(safe-area-inset-bottom))', sm: 1 },
  width: { xs: '100%', sm: 60 },
  flexShrink: 0,
  overflow: 'auto',
  borderTop: { xs: 1, sm: 0 },
  borderRight: { xs: 0, sm: 1 },
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

export const commandGroupStyles = {
  display: 'flex',
  flexDirection: { xs: 'row', sm: 'column' },
  gap: 0.5,
  flexShrink: 0,
}

export const settingsGroupStyles = {
  ...commandGroupStyles,
  mt: { xs: 0, sm: 'auto' },
}

export const settingsDrawerStyles = {
  width: { xs: '100%', sm: 400 },
  maxWidth: '100%',
  overflow: 'hidden',
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
