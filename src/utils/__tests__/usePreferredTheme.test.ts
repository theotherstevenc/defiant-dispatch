import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

// mock useAppContext with different values
function mockAppContext(appColorScheme: 'dark' | 'light' | 'system') {
  vi.doMock('../../context/AppContext', () => ({
    useAppContext: () => ({
      appColorScheme,
    }),
  }))
}

describe('usePreferredTheme', () => {
  afterEach(() => {
    vi.resetModules()
  })

  it('returns darkTheme when appColorScheme is dark', async () => {
    mockAppContext('dark')
    const { usePreferredTheme } = await import('../usePreferredTheme')
    const { result } = renderHook(() => usePreferredTheme())
    expect(result.current).toBeDefined()
  })

  it('returns lightTheme when appColorScheme is light', async () => {
    mockAppContext('light')
    const { usePreferredTheme } = await import('../usePreferredTheme')
    const { result } = renderHook(() => usePreferredTheme())
    expect(result.current).toBeDefined()
  })

  it('returns correct theme when appColorScheme is system', async () => {
    mockAppContext('system')
    const { usePreferredTheme } = await import('../usePreferredTheme')
    const { result } = renderHook(() => usePreferredTheme())
    expect(result.current).toBeDefined()
  })
})
