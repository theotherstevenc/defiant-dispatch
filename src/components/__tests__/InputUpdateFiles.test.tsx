import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as EditorContext from '../../context/EditorContext'
import { EditorContextProps } from '../../interfaces'
import InputUpdateFiles from '../InputUpdateFiles'

vi.mock('../../firebase', () => ({ db: {} }))

const mockUpdateWorkingFile = vi.fn().mockResolvedValue(undefined)
vi.mock('../../services/workingFilesService', () => ({
  updateWorkingFile: (...args: unknown[]) => mockUpdateWorkingFile(...args),
}))

vi.mock('../../utils/logError', () => ({ logError: vi.fn() }))

const mockSetWorkingFileName = vi.fn()

const baseEditorContext: EditorContextProps = {
  html: '',
  setHtml: vi.fn(),
  originalHtml: '',
  setOriginalHtml: vi.fn(),
  text: '',
  setText: vi.fn(),
  amp: '',
  setAmp: vi.fn(),
  workingFileID: 'file-1',
  setWorkingFileID: vi.fn(),
  deletedWorkingFileID: '',
  setDeletedWorkingFileID: vi.fn(),
  workingFileName: 'Old Name',
  setWorkingFileName: mockSetWorkingFileName,
  files: [],
  setFiles: vi.fn(),
  isFileLocked: false,
  setIsFileLocked: vi.fn(),
  editorFontSize: 14,
  setEditorFontSize: vi.fn(),
}

describe('InputUpdateFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(baseEditorContext)
  })

  it('renders the rename button', () => {
    render(<InputUpdateFiles />)
    expect(screen.getByLabelText('Rename Project')).toBeInTheDocument()
  })

  it('opens dialog with current file name pre-filled', () => {
    render(<InputUpdateFiles />)
    fireEvent.click(screen.getByLabelText('Rename Project'))
    expect(screen.getByLabelText('Project Name')).toHaveValue('Old Name')
  })

  it('does not open dialog when file is locked', () => {
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      isFileLocked: true,
    })
    render(<InputUpdateFiles />)
    fireEvent.click(screen.getByLabelText('Rename Project'))
    expect(screen.queryByLabelText('Project Name')).not.toBeInTheDocument()
  })

  it('calls updateFirestoreDoc and setWorkingFileName on confirm', async () => {
    render(<InputUpdateFiles />)
    fireEvent.click(screen.getByLabelText('Rename Project'))

    const input = screen.getByLabelText('Project Name')
    fireEvent.change(input, { target: { value: 'New Name' } })
    fireEvent.click(screen.getByText('OK'))

    await waitFor(() => {
      expect(mockUpdateWorkingFile).toHaveBeenCalledWith('file-1', {
        fileName: 'New Name',
      })
    })

    expect(mockSetWorkingFileName).toHaveBeenCalledWith('New Name')
  })

  it('does not open dialog when workingFileID matches deletedWorkingFileID', () => {
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      deletedWorkingFileID: 'file-1',
    })
    render(<InputUpdateFiles />)
    fireEvent.click(screen.getByLabelText('Rename Project'))
    expect(screen.queryByLabelText('Project Name')).not.toBeInTheDocument()
  })
})
