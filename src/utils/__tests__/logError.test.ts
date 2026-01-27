import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest'

import { logError } from '../logError'

describe('logError', () => {
  const originalEnv = process.env.NODE_ENV
  let consoleErrorSpy: MockInstance

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('logs detailed error in development', () => {
    process.env.NODE_ENV = 'development'
    logError('Test message', 'testFile.ts', new Error('Test error'))
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Test message] in [testFile.ts]', expect.any(Error))
  })

  it('logs generic error in production', () => {
    process.env.NODE_ENV = 'production'
    logError('Test message', 'testFile.ts', new Error('Test error'))
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred. Please try again later.')
  })

  it('logs generic error when no error details are provided', () => {
    process.env.NODE_ENV = 'development'
    logError('Test message', 'testFile.ts')
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Test message] in [testFile.ts]', '[no error details provided]')
  })
})
