/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer } from 'react'

export interface EditorConfigSettings {
  isMinifyEnabled: boolean
  isWordWrapEnabled: boolean
  isPreventThreadingEnabled: boolean
  activeEditor: string
  hideWorkingFiles: boolean
}

export type EditorConfigAction =
  | { type: 'SET_EDITOR_CONFIG_SETTINGS'; payload: Partial<EditorConfigSettings> }
  | { type: 'UPDATE_EDITOR_CONFIG_SETTING'; key: keyof EditorConfigSettings; value: EditorConfigSettings[keyof EditorConfigSettings] }
  | { type: 'RESET_EDITOR_CONFIG_SETTINGS' }

export interface EditorSettingsContextProps {
  editorConfigSettings: EditorConfigSettings
  dispatchEditorConfig: React.Dispatch<EditorConfigAction>
}

const EditorSettingsContext = createContext<EditorSettingsContextProps | undefined>(undefined)

const initialEditorConfigSettings: EditorConfigSettings = {
  isMinifyEnabled: false,
  isWordWrapEnabled: false,
  isPreventThreadingEnabled: false,
  activeEditor: '',
  hideWorkingFiles: true,
}

function editorConfigSettingsReducer(state: EditorConfigSettings, action: EditorConfigAction): EditorConfigSettings {
  switch (action.type) {
    case 'SET_EDITOR_CONFIG_SETTINGS':
      return { ...state, ...action.payload }
    case 'UPDATE_EDITOR_CONFIG_SETTING':
      return { ...state, [action.key]: action.value }
    case 'RESET_EDITOR_CONFIG_SETTINGS':
      return initialEditorConfigSettings
    default:
      return state
  }
}

export const EditorSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editorConfigSettings, dispatchEditorConfig] = useReducer(editorConfigSettingsReducer, initialEditorConfigSettings)

  return <EditorSettingsContext.Provider value={{ editorConfigSettings, dispatchEditorConfig }}>{children}</EditorSettingsContext.Provider>
}

export const useEditorSettingsContext = (): EditorSettingsContextProps => {
  const context = useContext(EditorSettingsContext)
  if (context === undefined) {
    throw new Error('useEditorSettingsContext must be used within an EditorSettingsProvider')
  }
  return context
}
