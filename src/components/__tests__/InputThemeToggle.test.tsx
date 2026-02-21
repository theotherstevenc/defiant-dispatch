import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import InputThemeToggle from '../InputThemeToggle'

const mockSetAppColorScheme = vi.fn()

vi.mock('../../context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: () => ({
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    isPreviewDarkMode: false,
    setIsPreviewDarkMode: vi.fn(),
    appColorScheme: '',
    setAppColorScheme: mockSetAppColorScheme,
  }),
}))

vi.mock('../../utils/updateFirestoreDoc', () => ({
  updateFirestoreDoc: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../firebase', () => ({ db: {} }))

describe('InputThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders three radio options', () => {
    render(<InputThemeToggle />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
  })

  it('defaults to system when appColorScheme is empty', () => {
    render(<InputThemeToggle />)
    const radios = screen.getAllByRole('radio')
    // system is the second radio (index 1) and should be checked when appColorScheme is falsy
    expect(radios[1]).toBeChecked()
  })

  it('calls setAppColorScheme when dark is selected', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    render(<InputThemeToggle />)
    const radios = screen.getAllByRole('radio')
    // dark is the third radio
    fireEvent.click(radios[2])
    await vi.waitFor(() => {
      expect(mockSetAppColorScheme).toHaveBeenCalledWith('dark')
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { appColorScheme: 'dark' })
    })
  })

  it('calls setAppColorScheme when light is selected', async () => {
    render(<InputThemeToggle />)
    const radios = screen.getAllByRole('radio')
    // light is the first radio
    fireEvent.click(radios[0])
    await vi.waitFor(() => {
      expect(mockSetAppColorScheme).toHaveBeenCalledWith('light')
    })
  })
})
