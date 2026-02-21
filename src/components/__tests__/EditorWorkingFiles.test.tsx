import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import EditorWorkingFiles from '../EditorWorkingFiles'

const mockSetHtml = vi.fn()
const mockSetText = vi.fn()
const mockSetAmp = vi.fn()
const mockSetWorkingFileID = vi.fn()
const mockSetWorkingFileName = vi.fn()
const mockSetIsFileLocked = vi.fn()

vi.mock('../../context/EditorContext', () => ({
  useEditorContext: () => ({
    setHtml: mockSetHtml,
    setText: mockSetText,
    setAmp: mockSetAmp,
    workingFileID: '1',
    setWorkingFileID: mockSetWorkingFileID,
    setWorkingFileName: mockSetWorkingFileName,
    files: [
      { id: '1', fileName: 'File One', html: '<h1>one</h1>', text: 'one', amp: '', isFileLocked: false },
      { id: '2', fileName: 'File Two', html: '<h1>two</h1>', text: 'two', amp: '', isFileLocked: true },
    ],
    setFiles: vi.fn(),
    setIsFileLocked: mockSetIsFileLocked,
  }),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({ user: { uid: 'abc' } }),
}))

describe('EditorWorkingFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders file names as buttons', () => {
    render(<EditorWorkingFiles />)
    expect(screen.getByText('File One')).toBeInTheDocument()
    expect(screen.getByText('File Two')).toBeInTheDocument()
  })

  it('shows lock icon on locked files', () => {
    render(<EditorWorkingFiles />)
    const lockIcons = document.querySelectorAll('[data-testid="LockIcon"]')
    expect(lockIcons.length).toBe(1)
  })

  it('uses contained variant for the active file', () => {
    render(<EditorWorkingFiles />)
    const fileOneButton = screen.getByText('File One').closest('button')
    const fileTwoButton = screen.getByText('File Two').closest('button')
    expect(fileOneButton?.className).toContain('contained')
    expect(fileTwoButton?.className).toContain('outlined')
  })

  it('calls context setters when a file is clicked', () => {
    render(<EditorWorkingFiles />)
    fireEvent.click(screen.getByText('File Two'))
    expect(mockSetHtml).toHaveBeenCalledWith('<h1>two</h1>')
    expect(mockSetText).toHaveBeenCalledWith('two')
    expect(mockSetAmp).toHaveBeenCalledWith('')
    expect(mockSetWorkingFileID).toHaveBeenCalledWith('2')
    expect(mockSetWorkingFileName).toHaveBeenCalledWith('File Two')
    expect(mockSetIsFileLocked).toHaveBeenCalledWith(true)
  })
})
