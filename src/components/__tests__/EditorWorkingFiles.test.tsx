import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import EditorWorkingFiles from '../EditorWorkingFiles'

vi.mock('../../context/EditorContext', () => ({
  useEditorContext: () => ({
    setHtml: vi.fn(),
    setText: vi.fn(),
    setAmp: vi.fn(),
    workingFileID: '',
    setWorkingFileID: vi.fn(),
    setWorkingFileName: vi.fn(),
    files: [
      { id: '1', fileName: 'File One', html: '', text: '', amp: '', isFileLocked: false },
      { id: '2', fileName: 'File Two', html: '', text: '', amp: '', isFileLocked: true },
    ],
    setFiles: vi.fn(),
    setIsFileLocked: vi.fn(),
  }),
}))
vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({ user: { uid: 'abc' } }),
}))

describe('EditorWorkingFiles', () => {
  it('renders file names as buttons', () => {
    render(<EditorWorkingFiles />)
    expect(screen.getByText('File One')).toBeInTheDocument()
    expect(screen.getByText('File Two')).toBeInTheDocument()
  })
})
