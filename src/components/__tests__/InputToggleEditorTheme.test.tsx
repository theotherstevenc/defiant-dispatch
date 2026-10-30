import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import InputToggleEditorTheme from '../InputToggleEditorTheme'

const mockSetIsDarkMode = vi.fn()
let mockIsDarkMode = false

vi.mock('../../context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: () => ({
    isDarkMode: mockIsDarkMode,
    setIsDarkMode: mockSetIsDarkMode,
    isPreviewDarkMode: false,
    setIsPreviewDarkMode: vi.fn(),
    appColorScheme: '',
    setAppColorScheme: vi.fn(),
  }),
}))

vi.mock('../../utils/updateFirestoreDoc', () => ({
  updateFirestoreDoc: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../firebase', () => ({ db: {} }))

describe('InputToggleEditorTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsDarkMode = false
  })

  it('shows the current code editor mode with no System option', () => {
    render(<InputToggleEditorTheme />)
    expect(screen.getByRole('radiogroup', { name: 'Code editor' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    expect(screen.queryByRole('radio', { name: 'System' })).not.toBeInTheDocument()
  })

  it('persists Dark using the existing editor boolean only', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    render(<InputToggleEditorTheme />)
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    await vi.waitFor(() => {
      expect(mockSetIsDarkMode).toHaveBeenCalledWith(true)
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { isDarkMode: true })
    })
  })

  it('reflects a saved Dark mode and explicitly switches back to Light', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    mockIsDarkMode = true
    render(<InputToggleEditorTheme />)
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: 'Light' }))
    await vi.waitFor(() => {
      expect(mockSetIsDarkMode).toHaveBeenCalledWith(false)
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { isDarkMode: false })
    })
  })
})
