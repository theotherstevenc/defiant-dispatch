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

export const inputConfigStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 0.5, sm: 1 },
  m: 1,
  flexShrink: 0,
}

export const toolbarButtonStyles = {
  minHeight: 44,
  minWidth: 44,
  px: 0.75,
  flexShrink: 0,
  textTransform: 'none',
  '& .MuiButton-startIcon': { mr: 0.5, ml: 0 },
  '& .MuiButton-endIcon': { ml: 0.25, mr: 0 },
}

export const settingsDrawerStyles = {
  width: { xs: '100%', sm: 400 },
  maxWidth: '100%',
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
