import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import InputToggleEditorTheme from '../InputToggleEditorTheme'

const mockSetIsDarkMode = vi.fn()

vi.mock('../../context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: () => ({
    isDarkMode: false,
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
  })

  it('renders with dark mode label when isDarkMode is false', () => {
    render(<InputToggleEditorTheme />)
    expect(screen.getByLabelText('Enable Editor Dark Mode')).toBeInTheDocument()
  })

  it('shows DarkModeIcon when isDarkMode is false', () => {
    render(<InputToggleEditorTheme />)
    expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument()
  })

  it('calls setIsDarkMode on click', async () => {
    render(<InputToggleEditorTheme />)
    fireEvent.click(screen.getByLabelText('Enable Editor Dark Mode'))
    // Wait for async handler
    await vi.waitFor(() => {
      expect(mockSetIsDarkMode).toHaveBeenCalledWith(true)
    })
  })

  it('calls updateFirestoreDoc on click', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    render(<InputToggleEditorTheme />)
    fireEvent.click(screen.getByLabelText('Enable Editor Dark Mode'))
    await vi.waitFor(() => {
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { isDarkMode: true })
    })
  })
})
