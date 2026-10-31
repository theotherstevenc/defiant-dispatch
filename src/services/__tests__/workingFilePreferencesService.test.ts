import { beforeEach, describe, expect, it, vi } from 'vitest'

import { saveWorkingFileOrder, subscribeToWorkingFileOrder } from '../workingFilePreferencesService'

interface TestSnapshot {
  exists: () => boolean
  data: () => unknown
  metadata: { hasPendingWrites: boolean }
}

const { mockDoc, mockOnSnapshot, mockSetDoc, unsubscribe } = vi.hoisted(() => ({
  mockDoc: vi.fn(() => 'preference-ref'),
  mockOnSnapshot: vi.fn<(ref: unknown, options: unknown, onData: (snapshot: TestSnapshot) => void, onError: (error: Error) => void) => () => void>(),
  mockSetDoc: vi.fn().mockResolvedValue(undefined),
  unsubscribe: vi.fn(),
}))

vi.mock('../../firebase', () => ({ db: 'test-db' }))
vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  onSnapshot: mockOnSnapshot,
  setDoc: mockSetDoc,
}))

describe('workingFilePreferencesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSnapshot.mockReturnValue(unsubscribe)
  })

  it('subscribes to the specified user and validates saved preferences', () => {
    const onData = vi.fn()
    const onError = vi.fn()
    const cleanup = subscribeToWorkingFileOrder('user-a', onData, onError)
    expect(mockDoc).toHaveBeenCalledWith('test-db', 'userPreferences', 'user-a')
    const onSnapshot = mockOnSnapshot.mock.calls[0][2]
    onSnapshot({ exists: () => true, data: () => ({ workingFileOrder: ['b', 'a'] }), metadata: { hasPendingWrites: false } })
    expect(onData).toHaveBeenCalledWith(['b', 'a'])
    expect(onError).not.toHaveBeenCalled()
    cleanup()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('uses the default order for a missing document or missing preference field', () => {
    const onData = vi.fn()
    subscribeToWorkingFileOrder('user-a', onData, vi.fn())
    const onSnapshot = mockOnSnapshot.mock.calls[0][2]
    onSnapshot({ exists: () => false, data: () => undefined, metadata: { hasPendingWrites: false } })
    onSnapshot({ exists: () => true, data: () => ({}), metadata: { hasPendingWrites: false } })
    expect(onData.mock.calls).toEqual([[[]], [[]]])
  })

  it('does not treat pending local writes as confirmed order', () => {
    const onData = vi.fn()
    subscribeToWorkingFileOrder('user-a', onData, vi.fn())
    mockOnSnapshot.mock.calls[0][2]({
      exists: () => true,
      data: () => ({ workingFileOrder: ['b'] }),
      metadata: { hasPendingWrites: true },
    })
    expect(onData).not.toHaveBeenCalled()
    expect(mockOnSnapshot.mock.calls[0][1]).toEqual({ includeMetadataChanges: true })
  })

  it.each([{ workingFileOrder: 'bad' }, { workingFileOrder: [123] }, { workingFileOrder: [''] }])(
    'reports malformed preferences rather than defaulting silently: %s',
    (data) => {
      const onData = vi.fn()
      const onError = vi.fn()
      subscribeToWorkingFileOrder('user-a', onData, onError)
      mockOnSnapshot.mock.calls[0][2]({ exists: () => true, data: () => data, metadata: { hasPendingWrites: false } })
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(onData).not.toHaveBeenCalled()
    }
  )

  it('forwards subscription failures and rejects failed writes', async () => {
    const onError = vi.fn()
    const error = new Error('permission-denied')
    subscribeToWorkingFileOrder('user-a', vi.fn(), onError)
    mockOnSnapshot.mock.calls[0][3](error)
    expect(onError).toHaveBeenCalledWith(error)
    mockSetDoc.mockRejectedValueOnce(error)
    await expect(saveWorkingFileOrder('user-a', ['b', 'a'])).rejects.toThrow('permission-denied')
  })

  it('merge-writes only the order to the specified user document', async () => {
    await saveWorkingFileOrder('user-b', ['b', 'a'])
    expect(mockDoc).toHaveBeenCalledWith('test-db', 'userPreferences', 'user-b')
    expect(mockSetDoc).toHaveBeenCalledWith('preference-ref', { workingFileOrder: ['b', 'a'] }, { merge: true })
  })
})
