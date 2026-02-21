import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import InputTogglePreviewTheme from '../InputTogglePreviewTheme'

const mockSetIsPreviewDarkMode = vi.fn()

vi.mock('../../context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: () => ({
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    isPreviewDarkMode: false,
    setIsPreviewDarkMode: mockSetIsPreviewDarkMode,
    appColorScheme: '',
    setAppColorScheme: vi.fn(),
  }),
}))

vi.mock('../../utils/updateFirestoreDoc', () => ({
  updateFirestoreDoc: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../firebase', () => ({ db: {} }))

describe('InputTogglePreviewTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with preview dark mode label when isPreviewDarkMode is false', () => {
    render(<InputTogglePreviewTheme />)
    expect(screen.getByLabelText('Enable Preview Dark Mode')).toBeInTheDocument()
  })

  it('shows DarkModeIcon when isPreviewDarkMode is false', () => {
    render(<InputTogglePreviewTheme />)
    expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument()
  })

  it('calls setIsPreviewDarkMode on click', async () => {
    render(<InputTogglePreviewTheme />)
    fireEvent.click(screen.getByLabelText('Enable Preview Dark Mode'))
    await vi.waitFor(() => {
      expect(mockSetIsPreviewDarkMode).toHaveBeenCalledWith(true)
    })
  })

  it('calls updateFirestoreDoc on click', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    render(<InputTogglePreviewTheme />)
    fireEvent.click(screen.getByLabelText('Enable Preview Dark Mode'))
    await vi.waitFor(() => {
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { isPreviewDarkMode: true })
    })
  })
})
