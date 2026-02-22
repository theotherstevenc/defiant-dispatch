import { useMediaQuery } from '@mui/material'
import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { useThemeSettingsContext } from '../../context/ThemeSettingsContext'
import { darkTheme, lightTheme } from '../../styles/global.theme'
import { usePreferredTheme } from '../usePreferredTheme'

vi.mock('../../context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: vi.fn(),
}))

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>()
  return {
    ...actual,
    useMediaQuery: vi.fn().mockReturnValue(false),
  }
})

describe('usePreferredTheme', () => {
  it('returns lightTheme when appColorScheme is "light"', () => {
    vi.mocked(useThemeSettingsContext).mockReturnValue({
      appColorScheme: 'light',
      setAppColorScheme: vi.fn(),
      isDarkMode: false,
      setIsDarkMode: vi.fn(),
      isPreviewDarkMode: false,
      setIsPreviewDarkMode: vi.fn(),
    })
    const { result } = renderHook(() => usePreferredTheme())
    expect(result.current).toBe(lightTheme)
  })

  it('returns darkTheme when appColorScheme is "dark"', () => {
    vi.mocked(useThemeSettingsContext).mockReturnValue({
      appColorScheme: 'dark',
      setAppColorScheme: vi.fn(),
      isDarkMode: false,
      setIsDarkMode: vi.fn(),
      isPreviewDarkMode: false,
      setIsPreviewDarkMode: vi.fn(),
    })
    const { result } = renderHook(() => usePreferredTheme())
    expect(result.current).toBe(darkTheme)
  })

  it('returns darkTheme when appColorScheme is "system" and prefers dark', () => {
    vi.mocked(useThemeSettingsContext).mockReturnValue({
      appColorScheme: 'system',
      setAppColorScheme: vi.fn(),
      isDarkMode: false,
      setIsDarkMode: vi.fn(),
      isPreviewDarkMode: false,
      setIsPreviewDarkMode: vi.fn(),
    })
    vi.mocked(useMediaQuery).mockReturnValue(true)
    const { result } = renderHook(() => usePreferredTheme())
    expect(result.current).toBe(darkTheme)
  })

  it('returns lightTheme when appColorScheme is "system" and prefers light', () => {
    vi.mocked(useThemeSettingsContext).mockReturnValue({
      appColorScheme: 'system',
      setAppColorScheme: vi.fn(),
      isDarkMode: false,
      setIsDarkMode: vi.fn(),
      isPreviewDarkMode: false,
      setIsPreviewDarkMode: vi.fn(),
    })
    vi.mocked(useMediaQuery).mockReturnValue(false)
    const { result } = renderHook(() => usePreferredTheme())
    expect(result.current).toBe(lightTheme)
  })

  it('returns lightTheme when appColorScheme is empty (default)', () => {
    vi.mocked(useThemeSettingsContext).mockReturnValue({
      appColorScheme: '',
      setAppColorScheme: vi.fn(),
      isDarkMode: false,
      setIsDarkMode: vi.fn(),
      isPreviewDarkMode: false,
      setIsPreviewDarkMode: vi.fn(),
    })
    vi.mocked(useMediaQuery).mockReturnValue(false)
    const { result } = renderHook(() => usePreferredTheme())
    expect(result.current).toBe(lightTheme)
  })
})
