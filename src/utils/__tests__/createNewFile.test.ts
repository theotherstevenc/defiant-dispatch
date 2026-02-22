import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createNewFile } from '../createNewFile'

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(() => Promise.resolve({ id: 'test-id' })),
  collection: vi.fn(() => 'mockCollection'),
  getFirestore: vi.fn(() => ({})),
  connectFirestoreEmulator: vi.fn(),
}))
vi.mock('../firebase', () => ({ db: {} }))
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
