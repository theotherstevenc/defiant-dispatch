import { describe, it, expect, vi } from 'vitest'

import { getCurrentDateTime } from '../getCurrentDateTime'

describe('getCurrentDateTime', () => {
  it('returns the current date and time in "YYYY-MM-DD HH:MM:SS" format', () => {
    const mockDate = new Date('2024-01-02T15:04:05.678Z')
    vi.setSystemTime(mockDate)

    const result = getCurrentDateTime()
    expect(result).toBe('2024-01-02 15:04:05')
  })
})
