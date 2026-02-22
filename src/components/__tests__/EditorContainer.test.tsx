import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as EditorConfigContext from '../../context/EditorConfigContext'
import { EditorConfigContextProps } from '../../interfaces'
import EditorContainer from '../EditorContainer'

vi.mock('../EditorWorkingFiles', () => ({
  default: () => <div data-testid='working-files'>Working Files</div>,
}))

vi.mock('../EditorWorkspacePreview', () => ({
  default: () => <div data-testid='workspace-preview'>Workspace Preview</div>,
}))

vi.mock('react-split', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid='split'>{children}</div>,
}))

const mockSetSizes = vi.fn()
vi.mock('../../utils/usePersistentValue', () => ({
  default: () => [[25, 75], mockSetSizes],
}))

const mockSetHideWorkingFiles = vi.fn()

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
  setHideWorkingFiles: mockSetHideWorkingFiles,
}

describe('EditorContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(EditorConfigContext, 'useEditorConfigContext').mockReturnValue(baseConfigContext)
  })

  it('renders EditorWorkingFiles and EditorWorkspacePreview', () => {
    render(<EditorContainer />)
    expect(screen.getByTestId('working-files')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-preview')).toBeInTheDocument()
  })

  it('renders within a Split component', () => {
    render(<EditorContainer />)
    expect(screen.getByTestId('split')).toBeInTheDocument()
  })

  it('does not restore sizes when hideWorkingFiles is false and sizes are above threshold', () => {
    render(<EditorContainer />)
    // sizes[0] is 25 (above minThreshold of 5), so setSizes should not be called
    expect(mockSetSizes).not.toHaveBeenCalled()
  })
})
