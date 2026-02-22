import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import * as EditorConfigContext from '../../context/EditorConfigContext'
import * as EditorContext from '../../context/EditorContext'
import * as ThemeSettingsContext from '../../context/ThemeSettingsContext'
import { EditorContextProps, EditorConfigContextProps, ThemeSettingsContextProps } from '../../interfaces'
import EditorWorkspacePreview from '../EditorWorkspacePreview'

vi.mock('@monaco-editor/react', () => ({
  Editor: ({ value, defaultLanguage }: { value: string; defaultLanguage: string }) => <div data-testid={`editor-${defaultLanguage}`}>{value}</div>,
}))

vi.mock('react-split', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid='split'>{children}</div>,
}))

vi.mock('../../firebase', () => ({ db: {} }))

const mockUpdateWorkingFile = vi.fn().mockResolvedValue(undefined)
vi.mock('../../services/workingFilesService', () => ({
  updateWorkingFile: (...args: unknown[]) => mockUpdateWorkingFile(...args),
}))

vi.mock('../../utils/usePersistentValue', () => ({
  default: () => [[50, 50], vi.fn()],
}))

vi.mock('../../utils/forceIframeReflow', () => ({
  default: vi.fn(),
}))

const baseEditorContext: EditorContextProps = {
  html: '<p>Hello</p>',
  setHtml: vi.fn(),
  originalHtml: '',
  setOriginalHtml: vi.fn(),
  text: 'Hello Text',
  setText: vi.fn(),
  amp: '<amp>Test</amp>',
  setAmp: vi.fn(),
  workingFileID: 'file-1',
  setWorkingFileID: vi.fn(),
  deletedWorkingFileID: '',
  setDeletedWorkingFileID: vi.fn(),
  workingFileName: 'File One',
  setWorkingFileName: vi.fn(),
  files: [{ id: 'file-1', fileName: 'File One', html: '<p>Hello</p>', text: 'Hello Text', amp: '<amp>Test</amp>', isFileLocked: false }],
  setFiles: vi.fn(),
  isFileLocked: false,
  setIsFileLocked: vi.fn(),
  editorFontSize: 14,
  setEditorFontSize: vi.fn(),
}

const baseThemeContext: ThemeSettingsContextProps = {
  isDarkMode: false,
  setIsDarkMode: vi.fn(),
  isPreviewDarkMode: false,
  setIsPreviewDarkMode: vi.fn(),
  appColorScheme: 'light',
  setAppColorScheme: vi.fn(),
}

const baseConfigContext: EditorConfigContextProps = {
  isMinifyEnabled: false,
  setIsMinifyEnabled: vi.fn(),
  isWordWrapEnabled: false,
  setIsWordWrapEnabled: vi.fn(),
  isPreventThreadingEnabled: false,
  setIsPreventThreadingEnabled: vi.fn(),
  activeEditor: 'html',
  setActiveEditor: vi.fn(),
  hideWorkingFiles: false,
  setHideWorkingFiles: vi.fn(),
}

describe('EditorWorkspacePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(baseEditorContext)
    vi.spyOn(ThemeSettingsContext, 'useThemeSettingsContext').mockReturnValue(baseThemeContext)
    vi.spyOn(EditorConfigContext, 'useEditorConfigContext').mockReturnValue(baseConfigContext)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the active HTML editor', () => {
    render(<EditorWorkspacePreview />)
    expect(screen.getByTestId('editor-html')).toBeInTheDocument()
    expect(screen.getByTestId('editor-html').textContent).toBe('<p>Hello</p>')
  })

  it('renders the text editor when activeEditor is text', () => {
    vi.spyOn(EditorConfigContext, 'useEditorConfigContext').mockReturnValue({
      ...baseConfigContext,
      activeEditor: 'text',
    })
    render(<EditorWorkspacePreview />)
    expect(screen.getByTestId('editor-text')).toBeInTheDocument()
    expect(screen.getByTestId('editor-text').textContent).toBe('Hello Text')
  })

  it('debounce saves to Firestore after 2 seconds', async () => {
    render(<EditorWorkspacePreview />)

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(mockUpdateWorkingFile).toHaveBeenCalledWith('file-1', {
      html: '<p>Hello</p>',
      text: 'Hello Text',
      amp: '<amp>Test</amp>',
    })
  })

  it('does not save when workingFileID matches deletedWorkingFileID', async () => {
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      deletedWorkingFileID: 'file-1',
    })

    render(<EditorWorkspacePreview />)

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(mockUpdateWorkingFile).not.toHaveBeenCalled()
  })

  it('does not save when workingFileID is empty', async () => {
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      workingFileID: '',
    })

    render(<EditorWorkspacePreview />)

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(mockUpdateWorkingFile).not.toHaveBeenCalled()
  })

  it('restores content from files when editor is empty', () => {
    const mockSetHtml = vi.fn()
    const mockSetText = vi.fn()
    const mockSetAmp = vi.fn()

    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      html: '',
      text: '',
      amp: '',
      setHtml: mockSetHtml,
      setText: mockSetText,
      setAmp: mockSetAmp,
      files: [
        { id: 'file-1', fileName: 'File One', html: '<p>Restored</p>', text: 'Restored Text', amp: '<amp>Restored</amp>', isFileLocked: false },
      ],
    })

    render(<EditorWorkspacePreview />)

    expect(mockSetHtml).toHaveBeenCalledWith('<p>Restored</p>')
    expect(mockSetText).toHaveBeenCalledWith('Restored Text')
    expect(mockSetAmp).toHaveBeenCalledWith('<amp>Restored</amp>')
  })

  it('does not restore content when files array is empty', () => {
    const mockSetHtml = vi.fn()

    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      html: '',
      text: '',
      amp: '',
      setHtml: mockSetHtml,
      files: [],
    })

    render(<EditorWorkspacePreview />)

    expect(mockSetHtml).not.toHaveBeenCalled()
  })
})
