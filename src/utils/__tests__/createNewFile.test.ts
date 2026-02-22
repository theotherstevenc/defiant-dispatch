import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createNewFile } from '../createNewFile'

vi.mock('../../services/workingFilesService', () => ({
  createWorkingFile: vi.fn(() => Promise.resolve('test-id')),
}))
vi.mock('./logError', () => ({ logError: vi.fn() }))

describe('createNewFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns new file data with boilerplate content', async () => {
    const result = await createNewFile({
      fileName: 'My File',
      boilerPlateMarkup: { html: '<h1>Hello</h1>', text: 'Hello', amp: '<amp>' },
      isBoilerplateApplied: true,
    })

    expect(result).toEqual({
      id: 'test-id',
      fileName: 'My File',
      html: '<h1>Hello</h1>',
      text: 'Hello',
      amp: '<amp>',
      isFileLocked: false,
    })
  })

  it('returns new file data with empty content when boilerplate is false', async () => {
    const result = await createNewFile({
      fileName: 'No Boilerplate',
      boilerPlateMarkup: { html: '', text: '', amp: '' },
      isBoilerplateApplied: false,
    })

    expect(result).toEqual({
      id: 'test-id',
      fileName: 'No Boilerplate',
      html: '',
      text: '',
      amp: '',
      isFileLocked: false,
    })
  })
})
