import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as EditorContext from '../../context/EditorContext'
import { EditorContextProps } from '../../interfaces'
import InputLockFile from '../InputLockFile'

vi.mock('../../firebase', () => ({ db: {} }))

const mockUpdateWorkingFile = vi.fn().mockResolvedValue(undefined)
vi.mock('../../services/workingFilesService', () => ({
  updateWorkingFile: (...args: unknown[]) => mockUpdateWorkingFile(...args),
}))

vi.mock('../../utils/logError', () => ({ logError: vi.fn() }))

const mockSetIsFileLocked = vi.fn()

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
  workingFileName: '',
  setWorkingFileName: vi.fn(),
  files: [],
  setFiles: vi.fn(),
  isFileLocked: false,
  setIsFileLocked: mockSetIsFileLocked,
  editorFontSize: 14,
  setEditorFontSize: vi.fn(),
}

describe('InputLockFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(baseEditorContext)
  })

  it('renders the lock button with unlock icon when unlocked', () => {
    render(<InputLockFile />)
    expect(screen.getByLabelText('Lock file')).toBeInTheDocument()
    expect(screen.queryByTestId('LockOpenIcon')).toBeInTheDocument()
  })

  it('renders with lock icon when file is locked', () => {
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      isFileLocked: true,
    })
    render(<InputLockFile />)
    expect(screen.getByLabelText('Unlock file')).toBeInTheDocument()
    expect(screen.queryByTestId('LockIcon')).toBeInTheDocument()
  })

  it('calls updateFirestoreDoc and setIsFileLocked on click', async () => {
    render(<InputLockFile />)
    fireEvent.click(screen.getByLabelText('Lock file'))

    await waitFor(() => {
      expect(mockUpdateWorkingFile).toHaveBeenCalledWith('file-1', {
        isFileLocked: true,
      })
    })

    expect(mockSetIsFileLocked).toHaveBeenCalledWith(true)
  })

  it('toggles to unlocked when already locked', async () => {
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue({
      ...baseEditorContext,
      isFileLocked: true,
    })
    render(<InputLockFile />)
    fireEvent.click(screen.getByLabelText('Unlock file'))

    await waitFor(() => {
      expect(mockUpdateWorkingFile).toHaveBeenCalledWith('file-1', {
        isFileLocked: false,
      })
    })
  })
})
