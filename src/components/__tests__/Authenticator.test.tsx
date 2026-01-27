import { render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'

import { Authenticator } from '../../components'
import * as AppContext from '../../context/AppContext'
import * as EditorContext from '../../context/EditorContext'
import { AppContextProps, EditorContextProps } from '../../interfaces'

const mockAppContext: AppContextProps = {
  isMinifyEnabled: false,
  setIsMinifyEnabled: vi.fn(),
  isWordWrapEnabled: false,
  setIsWordWrapEnabled: vi.fn(),
  isPreventThreadingEnabled: false,
  setIsPreventThreadingEnabled: vi.fn(),
  activeEditor: '',
  setActiveEditor: vi.fn(),
  subject: '',
  setSubject: vi.fn(),
  emailAddresses: [],
  setEmailAddresses: vi.fn(),
  inputSenderSettings: {
    host: '',
    port: '',
    username: '',
    pass: '',
    from: '',
  },
  setInputSenderSettings: vi.fn(),
  hideWorkingFiles: false,
  setHideWorkingFiles: vi.fn(),
  isDarkMode: false,
  setIsDarkMode: vi.fn(),
  isPreviewDarkMode: false,
  setIsPreviewDarkMode: vi.fn(),
  appColorScheme: '',
  setAppColorScheme: vi.fn(),
  user: null,
}

vi.spyOn(AppContext, 'useAppContext').mockReturnValue(mockAppContext)

const mockEditorContext: EditorContextProps = {
  html: '',
  setHtml: vi.fn(),
  originalHtml: '',
  setOriginalHtml: vi.fn(),
  text: '',
  setText: vi.fn(),
  amp: '',
  setAmp: vi.fn(),
  workingFileID: '',
  setWorkingFileID: vi.fn(),
  deletedWorkingFileID: '',
  setDeletedWorkingFileID: vi.fn(),
  workingFileName: '',
  setWorkingFileName: vi.fn(),
  files: [],
  setFiles: vi.fn(),
  isFileLocked: false,
  setIsFileLocked: vi.fn(),
  editorFontSize: 0,
  setEditorFontSize: vi.fn(),
}

vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(mockEditorContext)

describe('Authenticator', () => {
  beforeEach(() => {
    render(<Authenticator />)
  })

  it('renders without crashing', () => {
    expect(true).toBe(true)
  })

  it('shows the login button when user is not authenticated', () => {
    const loginIconButtons = screen.getAllByRole('button', { name: 'Login' })
    expect(loginIconButtons.length).toBeGreaterThan(0)
  })
})
