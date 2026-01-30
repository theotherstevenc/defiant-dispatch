import { render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'

import { Authenticator } from '../../components'
import * as AppContext from '../../context/AppContext'
import * as EditorContext from '../../context/EditorContext'
import { AppContextProps, EditorContextProps } from '../../interfaces'

const mockAppContext: AppContextProps = {
  settings: {
    subject: '',
    host: '',
    port: '',
    username: '',
    pass: '',
    from: '',
    isMinifyEnabled: false,
    isWordWrapEnabled: false,
    isPreventThreadingEnabled: false,
    activeEditor: '',
    emailAddresses: [],
    hideWorkingFiles: false,
    isDarkMode: false,
    isPreviewDarkMode: false,
    appColorScheme: '',
  },
  dispatch: vi.fn(),
  loading: false,
  error: null,
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
