import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { logError } from '../../utils/logError'
import { updateFirestoreDoc } from '../../utils/updateFirestoreDoc'
import InputThemeToggle from '../InputThemeToggle'

const mockSetAppColorScheme = vi.fn()
let mockAppColorScheme = ''

vi.mock('../../context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: () => ({
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    isPreviewDarkMode: false,
    setIsPreviewDarkMode: vi.fn(),
    appColorScheme: mockAppColorScheme,
    setAppColorScheme: mockSetAppColorScheme,
  }),
}))

vi.mock('../../utils/updateFirestoreDoc', () => ({
  updateFirestoreDoc: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../firebase', () => ({ db: {} }))
vi.mock('../../utils/logError', () => ({ logError: vi.fn() }))

describe('InputThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAppColorScheme = ''
  })

  it('labels the app interface choices and reflects the actual light default when unset', () => {
    render(<InputThemeToggle />)
    expect(screen.getByRole('radiogroup', { name: 'App interface' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'System' })).not.toBeChecked()
  })

  it.each(['light', 'dark', 'system'])('reflects the saved %s selection', (mode) => {
    mockAppColorScheme = mode
    render(<InputThemeToggle />)
    expect(screen.getByRole('radio', { name: new RegExp(mode, 'i') })).toBeChecked()
  })

  it.each(['Dark', 'System'])('persists %s without changing editor or preview preferences', async (mode) => {
    render(<InputThemeToggle />)
    fireEvent.click(screen.getByRole('radio', { name: mode }))
    await vi.waitFor(() => {
      expect(mockSetAppColorScheme).toHaveBeenCalledWith(mode.toLowerCase())
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { appColorScheme: mode.toLowerCase() })
    })
  })

  it('retains the selected mode and reports a failed save', async () => {
    vi.mocked(updateFirestoreDoc).mockRejectedValueOnce(new Error('Save failed'))
    render(<InputThemeToggle />)
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    await vi.waitFor(() => {
      expect(logError).toHaveBeenCalled()
    })
    expect(mockSetAppColorScheme).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
  })
})
