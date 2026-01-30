import { User } from 'firebase/auth'

export interface SenderSettings {
  host: string
  port: string
  username: string
  pass: string
  from: string
}

export interface EmailData {
  testaddress: string[]
  testsubject: string
  htmlversion: string
  textversion: string
  ampversion: string
  host: string
  port: string
  username: string
  pass: string
  from: string
}

export interface WorkingFile {
  id: string
  fileName: string
  html: string
  text: string
  amp: string
  isFileLocked: boolean
}

export interface EditorContextProps {
  html: string
  setHtml: (html: string) => void
  originalHtml: string
  setOriginalHtml: (html: string) => void
  text: string
  setText: (text: string) => void
  amp: string
  setAmp: (amp: string) => void
  workingFileID: string
  setWorkingFileID: (id: string) => void
  deletedWorkingFileID: string
  setDeletedWorkingFileID: (id: string) => void
  workingFileName: string
  setWorkingFileName: (name: string) => void
  files: WorkingFile[]
  setFiles: React.Dispatch<React.SetStateAction<WorkingFile[]>>
  isFileLocked: boolean
  setIsFileLocked: (isFileLocked: boolean) => void
  editorFontSize: number
  setEditorFontSize: (fontSize: number) => void
}

// EditorSettings state object (replaces individual state variables)
export interface EditorSettings {
  subject: string
  host: string
  port: string
  username: string
  pass: string
  from: string
  isMinifyEnabled: boolean
  isWordWrapEnabled: boolean
  isPreventThreadingEnabled: boolean
  activeEditor: string
  emailAddresses: string[]
  hideWorkingFiles: boolean
  isDarkMode: boolean
  isPreviewDarkMode: boolean
  appColorScheme: string
}

// Action types for the EditorSettings reducer
export type EditorSettingsAction =
  | { type: 'SET_SETTINGS'; payload: Partial<EditorSettings> }
  | { type: 'UPDATE_SETTING'; key: keyof EditorSettings; value: EditorSettings[keyof EditorSettings] }
  | { type: 'RESET_SETTINGS' }

// New AppContextProps using reducer pattern
export interface AppContextProps {
  settings: EditorSettings
  dispatch: React.Dispatch<EditorSettingsAction>
  loading: boolean
  error: Error | null
  user: User | null
}
