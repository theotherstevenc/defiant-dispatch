import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as EditorContext from '../../context/EditorContext'
import { EditorContextProps } from '../../interfaces'
import InputDeleteFile from '../InputDeleteFile'

const mockDeleteWorkingFile = vi.fn().mockResolvedValue(undefined)
vi.mock('../../services/workingFilesService', () => ({
  deleteWorkingFile: (...args: unknown[]) => mockDeleteWorkingFile(...args),
}))

vi.mock('../../utils/logError', () => ({ logError: vi.fn() }))

const mockSetHtml = vi.fn()
const mockSetText = vi.fn()
const mockSetAmp = vi.fn()
const mockSetDeletedWorkingFileID = vi.fn()

const baseEditorContext: EditorContextProps = {
  html: '<p>Content</p>',
  setHtml: mockSetHtml,
  originalHtml: '',
  setOriginalHtml: vi.fn(),
  text: 'Content',
  setText: mockSetText,
  amp: '',
  setAmp: mockSetAmp,
  workingFileID: 'file-1',
  setWorkingFileID: vi.fn(),
  deletedWorkingFileID: '',
  setDeletedWorkingFileID: mockSetDeletedWorkingFileID,
  workingFileName: 'My Project',
  setWorkingFileName: vi.fn(),
  files: [],
  setFiles: vi.fn(),
  isFileLocked: false,
  setIsFileLocked: vi.fn(),
  editorFontSize: 14,
  setEditorFontSize: vi.fn(),
}

describe('InputDeleteFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(baseEditorContext)
  })

  it('renders the delete button', () => {
    render(<InputDeleteFile />)
    expect(screen.getByLabelText('Delete Project')).toBeInTheDocument()
  })

  it('opens confirmation dialog when delete button is clicked', () => {
    render(<InputDeleteFile />)
    fireEvent.click(screen.getByLabelText('Delete Project'))
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
    expect(screen.getByText(/My Project/)).toBeInTheDocument()
  })

  it('does not open dialog when file is locked', () => {
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      isFileLocked: true,
    })
    render(<InputDeleteFile />)
    fireEvent.click(screen.getByLabelText('Delete Project'))
    expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument()
  })

  it('does not open dialog when workingFileID is empty', () => {
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      workingFileID: '',
    })
    render(<InputDeleteFile />)
    fireEvent.click(screen.getByLabelText('Delete Project'))
    expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument()
  })

  it('calls deleteDoc and clears editor on confirm', async () => {
    render(<InputDeleteFile />)
    fireEvent.click(screen.getByLabelText('Delete Project'))
    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(mockDeleteWorkingFile).toHaveBeenCalledWith('file-1')
    })

    expect(mockSetHtml).toHaveBeenCalledWith('')
    expect(mockSetText).toHaveBeenCalledWith('')
    expect(mockSetAmp).toHaveBeenCalledWith('')
    expect(mockSetDeletedWorkingFileID).toHaveBeenCalledWith('file-1')
  })
})
