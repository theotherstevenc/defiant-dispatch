import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as EditorConfigContext from '../../context/EditorConfigContext'
import * as EditorContext from '../../context/EditorContext'
import { EditorConfigContextProps, EditorContextProps } from '../../interfaces'
import InputCreateNewFile from '../InputCreateNewFile'

const mockCreateNewFile = vi.fn()
vi.mock('../../utils/createNewFile', () => ({
  createNewFile: (...args: unknown[]) => mockCreateNewFile(...args),
}))

vi.mock('../../utils/logError', () => ({ logError: vi.fn() }))

const mockSetWorkingFileID = vi.fn()
const mockSetWorkingFileName = vi.fn()
const mockSetHtml = vi.fn()
const mockSetText = vi.fn()
const mockSetAmp = vi.fn()
const mockSetIsFileLocked = vi.fn()
const mockSetIsMinifyEnabled = vi.fn()
const mockSetIsWordWrapEnabled = vi.fn()

const baseEditorContext: EditorContextProps = {
  html: '',
  setHtml: mockSetHtml,
  originalHtml: '',
  setOriginalHtml: vi.fn(),
  text: '',
  setText: mockSetText,
  amp: '',
  setAmp: mockSetAmp,
  workingFileID: 'file-1',
  setWorkingFileID: mockSetWorkingFileID,
  deletedWorkingFileID: '',
  setDeletedWorkingFileID: vi.fn(),
  workingFileName: 'Test File',
  setWorkingFileName: mockSetWorkingFileName,
  files: [],
  setFiles: vi.fn(),
  isFileLocked: false,
  setIsFileLocked: mockSetIsFileLocked,
  editorFontSize: 14,
  setEditorFontSize: vi.fn(),
}

const baseConfigContext: EditorConfigContextProps = {
  isMinifyEnabled: false,
  setIsMinifyEnabled: mockSetIsMinifyEnabled,
  isWordWrapEnabled: false,
  setIsWordWrapEnabled: mockSetIsWordWrapEnabled,
  isPreventThreadingEnabled: false,
  setIsPreventThreadingEnabled: vi.fn(),
  activeEditor: 'html',
  setActiveEditor: vi.fn(),
  hideWorkingFiles: false,
  setHideWorkingFiles: vi.fn(),
}

describe('InputCreateNewFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(baseEditorContext)
    vi.spyOn(EditorConfigContext, 'useEditorConfigContext').mockReturnValue(baseConfigContext)
  })

  it('renders the create button', () => {
    render(<InputCreateNewFile />)
    expect(screen.getByLabelText('Create New Project')).toBeInTheDocument()
  })

  it('opens dialog when create button is clicked', () => {
    render(<InputCreateNewFile />)
    fireEvent.click(screen.getByLabelText('Create New Project'))
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
  })

  it('calls createNewFile with correct args and sets context on success', async () => {
    mockCreateNewFile.mockResolvedValue({
      id: 'new-id',
      fileName: 'My Project',
      html: '<h1>Hi</h1>',
      text: 'Hi',
      amp: '',
      isFileLocked: false,
    })

    render(<InputCreateNewFile />)
    fireEvent.click(screen.getByLabelText('Create New Project'))

    const input = screen.getByLabelText('Project Name')
    fireEvent.change(input, { target: { value: 'My Project' } })
    fireEvent.click(screen.getByText('OK'))

    await waitFor(() => {
      expect(mockCreateNewFile).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'My Project' }))
    })

    await waitFor(() => {
      expect(mockSetWorkingFileID).toHaveBeenCalledWith('new-id')
      expect(mockSetWorkingFileName).toHaveBeenCalledWith('My Project')
      expect(mockSetHtml).toHaveBeenCalledWith('<h1>Hi</h1>')
    })
  })

  it('does not set file context values when createNewFile returns false', async () => {
    mockCreateNewFile.mockResolvedValue(false)

    render(<InputCreateNewFile />)
    fireEvent.click(screen.getByLabelText('Create New Project'))

    const input = screen.getByLabelText('Project Name')
    fireEvent.change(input, { target: { value: 'Bad File' } })
    fireEvent.click(screen.getByText('OK'))

    await waitFor(() => {
      expect(mockCreateNewFile).toHaveBeenCalled()
    })

    // setWorkingFileID is called once with '' (reset), but never with a file id
    expect(mockSetWorkingFileName).not.toHaveBeenCalled()
    expect(mockSetHtml).not.toHaveBeenCalled()
  })
})
