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
  gap: '0.175rem',
  margin: '0.5rem',
}

export const inputSenderSettingsStyles = {
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  gap: '0.175rem',
  flexWrap: 'wrap',
}

export const inputActionsStyles = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'right',
  alignItems: 'center',
  gap: '0.175rem',
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
