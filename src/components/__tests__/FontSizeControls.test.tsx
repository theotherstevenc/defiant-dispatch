import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as EditorContext from '../../context/EditorContext'
import { EditorContextProps } from '../../interfaces'
import FontSizeControls from '../FontSizeControls'

const mockSetEditorFontSize = vi.fn()

const baseEditorContext: EditorContextProps = {
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
  editorFontSize: 14,
  setEditorFontSize: mockSetEditorFontSize,
}

describe('FontSizeControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(baseEditorContext)
  })

  it('renders increase, reset, and decrease buttons', () => {
    render(<FontSizeControls />)
    expect(screen.getByLabelText('Increase Editor Font Size')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset Editor Font Size')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrease Editor Font Size')).toBeInTheDocument()
  })

  it('calls setEditorFontSize with incremented value on increase click', () => {
    render(<FontSizeControls />)
    fireEvent.click(screen.getByLabelText('Increase Editor Font Size'))
    expect(mockSetEditorFontSize).toHaveBeenCalledWith(15)
  })

  it('calls setEditorFontSize with decremented value on decrease click', () => {
    render(<FontSizeControls />)
    fireEvent.click(screen.getByLabelText('Decrease Editor Font Size'))
    expect(mockSetEditorFontSize).toHaveBeenCalledWith(13)
  })

  it('calls setEditorFontSize with default (12) on reset click', () => {
    render(<FontSizeControls />)
    fireEvent.click(screen.getByLabelText('Reset Editor Font Size'))
    expect(mockSetEditorFontSize).toHaveBeenCalledWith(12)
  })
})
