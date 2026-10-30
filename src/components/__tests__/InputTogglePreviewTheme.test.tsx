import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import InputTogglePreviewTheme from '../InputTogglePreviewTheme'

const mockSetIsPreviewDarkMode = vi.fn()
let mockIsPreviewDarkMode = false

vi.mock('../../context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: () => ({
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    isPreviewDarkMode: mockIsPreviewDarkMode,
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
    mockIsPreviewDarkMode = false
  })

  it('shows the current email preview mode with no System option', () => {
    render(<InputTogglePreviewTheme />)
    expect(screen.getByRole('radiogroup', { name: 'Email preview' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    expect(screen.queryByRole('radio', { name: 'System' })).not.toBeInTheDocument()
  })

  it('persists Dark using the existing preview boolean only', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    render(<InputTogglePreviewTheme />)
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    await vi.waitFor(() => {
      expect(mockSetIsPreviewDarkMode).toHaveBeenCalledWith(true)
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { isPreviewDarkMode: true })
    })
  })

  it('reflects a saved Dark mode and explicitly switches back to Light', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    mockIsPreviewDarkMode = true
    render(<InputTogglePreviewTheme />)
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: 'Light' }))
    await vi.waitFor(() => {
      expect(mockSetIsPreviewDarkMode).toHaveBeenCalledWith(false)
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { isPreviewDarkMode: false })
    })
  })
})
