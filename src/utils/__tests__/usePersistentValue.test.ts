import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../logError', () => ({
  logError: vi.fn(),
}))

import { logError } from '../logError'
import usePersistentValue from '../usePersistentValue'

beforeEach(() => {
  let store: Record<string, string> = {}
  global.localStorage = {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    key: vi.fn(),
    length: 0,
  }
  vi.clearAllMocks()
})

describe('usePersistentValue', () => {
  it('localStorage mock works', () => {
    global.localStorage.setItem('foo', 'bar')
    expect(global.localStorage.getItem('foo')).toBe('bar')
    global.localStorage.removeItem('foo')
    expect(global.localStorage.getItem('foo')).toBeNull()
  })

  it('returns default value if nothing in localStorage', () => {
    const { result } = renderHook(() => usePersistentValue('myKey', 42))
    expect(result.current[0]).toBe(42)
  })

  it('returns parsed value from localStorage if present', () => {
    global.localStorage.setItem('myKey', JSON.stringify(99))
    const { result } = renderHook(() => usePersistentValue('myKey', 42))
    expect(result.current[0]).toBe(99)
  })

  it('updates value and persists to localStorage', () => {
    const { result } = renderHook(() => usePersistentValue('myKey', 42))
    act(() => {
      result.current[1](100)
    })
    expect(global.localStorage.setItem).toHaveBeenCalledWith('myKey', JSON.stringify(100))
    expect(result.current[0]).toBe(100)
  })

  it('logs error and uses default if localStorage has invalid JSON', () => {
    global.localStorage.setItem('badKey', 'not-json')
    const { result } = renderHook(() => usePersistentValue('badKey', 7))
    expect(result.current[0]).toBe(7)
    expect(logError).toHaveBeenCalledWith('Failed to parse from localStorage:', 'usePersistentValue', expect.any(Error))
  })
})
