import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { saveWorkingFileOrder, subscribeToWorkingFileOrder } from '../../services/workingFilePreferencesService'
import { WORKING_FILES_LOAD_ERROR, WORKING_FILES_SAVED, WORKING_FILES_SAVE_ERROR } from '../constants'
import { logError } from '../logError'
import { useWorkingFileOrder } from '../useWorkingFileOrder'

import type { WorkingFile } from '../../interfaces'

vi.mock('../../services/workingFilePreferencesService', () => ({
  subscribeToWorkingFileOrder: vi.fn(),
  saveWorkingFileOrder: vi.fn(),
}))
vi.mock('../logError', () => ({ logError: vi.fn() }))

const files: WorkingFile[] = ['a', 'b', 'c'].map((id) => ({
  id,
  fileName: id.toUpperCase(),
  html: id,
  text: '',
  amp: '',
  isFileLocked: id === 'b',
}))
const listeners: {
  uid: string
  onData: (order: string[]) => void
  onError: (error: Error) => void
  unsubscribe: ReturnType<typeof vi.fn>
}[] = []
const ids = (ordered: WorkingFile[]) => ordered.map((file) => file.id)

describe('useWorkingFileOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listeners.length = 0
    vi.mocked(subscribeToWorkingFileOrder).mockImplementation((uid, onData, onError) => {
      const unsubscribe = vi.fn()
      listeners.push({ uid, onData, onError, unsubscribe })
      return unsubscribe
    })
    vi.mocked(saveWorkingFileOrder).mockResolvedValue(undefined)
  })

  it('disables reordering until preferences load, then follows remote updates without writing', () => {
    const { result } = renderHook(() => useWorkingFileOrder('user-a', files))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.canReorder).toBe(false)
    expect(ids(result.current.orderedFiles)).toEqual(['a', 'b', 'c'])

    act(() => listeners[0].onData(['b', 'a']))
    expect(result.current.canReorder).toBe(true)
    expect(ids(result.current.orderedFiles)).toEqual(['b', 'a', 'c'])
    act(() => listeners[0].onData(['c', 'b', 'a']))
    expect(ids(result.current.orderedFiles)).toEqual(['c', 'b', 'a'])
    expect(saveWorkingFileOrder).not.toHaveBeenCalled()
  })

  it('moves optimistically, ignores overlapping/no-op requests, and confirms the save', async () => {
    let resolveSave: () => void = () => {}
    vi.mocked(saveWorkingFileOrder).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        })
    )
    const { result } = renderHook(() => useWorkingFileOrder('user-a', files))
    act(() => listeners[0].onData([]))

    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.moveFile('b', 0)
      void result.current.moveFile('c', 0)
    })
    expect(ids(result.current.orderedFiles)).toEqual(['b', 'a', 'c'])
    expect(result.current.isSaving).toBe(true)
    expect(result.current.canReorder).toBe(false)
    expect(result.current.announcement).toContain('B moved to position 1 of 3.')
    expect(saveWorkingFileOrder).toHaveBeenCalledExactlyOnceWith('user-a', ['b', 'a', 'c'])
    act(() => listeners[0].onData(['b', 'a', 'c']))
    await act(async () => {
      resolveSave()
      await pending
    })
    expect(result.current.isSaving).toBe(false)
    expect(result.current.announcement).toBe(WORKING_FILES_SAVED)
    await act(async () => {
      await result.current.moveFile('b', 0)
    })
    expect(saveWorkingFileOrder).toHaveBeenCalledTimes(1)
  })

  it('restores the latest confirmed remote order on failure, not stale optimistic state', async () => {
    let rejectSave: (error: Error) => void = () => {}
    vi.mocked(saveWorkingFileOrder).mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectSave = reject
        })
    )
    const { result } = renderHook(() => useWorkingFileOrder('user-a', files))
    act(() => listeners[0].onData([]))
    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.moveFile('b', 0)
    })
    act(() => listeners[0].onData(['c', 'a', 'b']))
    expect(ids(result.current.orderedFiles)).toEqual(['b', 'a', 'c'])

    const error = new Error('denied')
    await act(async () => {
      rejectSave(error)
      await pending
    })
    expect(ids(result.current.orderedFiles)).toEqual(['c', 'a', 'b'])
    expect(result.current.error).toBe(WORKING_FILES_SAVE_ERROR)
    expect(result.current.canReorder).toBe(true)
    expect(logError).toHaveBeenCalledWith('Could not save working-file order', 'useWorkingFileOrder', error)
  })

  it('keeps the newest confirmed snapshot when another device saves before write completion', async () => {
    let resolveSave: () => void = () => {}
    vi.mocked(saveWorkingFileOrder).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        })
    )
    const { result } = renderHook(() => useWorkingFileOrder('user-a', files))
    act(() => listeners[0].onData([]))
    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.moveFile('b', 0)
    })
    act(() => listeners[0].onData(['b', 'a', 'c']))
    act(() => listeners[0].onData(['c', 'b', 'a']))
    await act(async () => {
      resolveSave()
      await pending
    })
    expect(ids(result.current.orderedFiles)).toEqual(['c', 'b', 'a'])
  })

  it('retains the saved order if the write promise settles before its confirmation snapshot', async () => {
    const { result } = renderHook(() => useWorkingFileOrder('user-a', files))
    act(() => listeners[0].onData([]))
    await act(async () => {
      await result.current.moveFile('c', 0)
    })
    expect(ids(result.current.orderedFiles)).toEqual(['c', 'a', 'b'])
    act(() => listeners[0].onData(['c', 'a', 'b']))
    expect(ids(result.current.orderedFiles)).toEqual(['c', 'a', 'b'])
  })

  it('blocks reorder on load failure and retries the subscription explicitly', () => {
    const { result } = renderHook(() => useWorkingFileOrder('user-a', files))
    act(() => listeners[0].onError(new Error('denied')))
    expect(result.current.error).toBe(WORKING_FILES_LOAD_ERROR)
    expect(result.current.canReorder).toBe(false)
    act(() => result.current.retryLoading())
    expect(listeners[0].unsubscribe).toHaveBeenCalledOnce()
    expect(result.current.isLoading).toBe(true)
    act(() => listeners[1].onData(['b']))
    expect(result.current.error).toBeNull()
    expect(result.current.canReorder).toBe(true)
  })

  it('does not enable reordering if a subscription fails during a successful write', async () => {
    let resolveSave: () => void = () => {}
    vi.mocked(saveWorkingFileOrder).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        })
    )
    const { result } = renderHook(() => useWorkingFileOrder('user-a', files))
    act(() => listeners[0].onData([]))
    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.moveFile('b', 0)
    })
    act(() => listeners[0].onError(new Error('unavailable')))
    await act(async () => {
      resolveSave()
      await pending
    })
    expect(result.current.hasLoadError).toBe(true)
    expect(result.current.canReorder).toBe(false)
  })

  it('resets preferences on user changes and ignores old snapshots and in-flight writes', async () => {
    let resolveSave: () => void = () => {}
    vi.mocked(saveWorkingFileOrder).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        })
    )
    const { result, rerender, unmount } = renderHook(({ uid }) => useWorkingFileOrder(uid, files), { initialProps: { uid: 'user-a' } })
    act(() => listeners[0].onData(['c']))
    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.moveFile('b', 0)
    })
    rerender({ uid: 'user-b' })
    expect(listeners[0].unsubscribe).toHaveBeenCalledOnce()
    expect(result.current.isLoading).toBe(true)
    expect(ids(result.current.orderedFiles)).toEqual(['a', 'b', 'c'])
    act(() => listeners[1].onData(['b']))
    await act(async () => {
      listeners[0].onData(['c'])
      resolveSave()
      await pending
    })
    expect(ids(result.current.orderedFiles)).toEqual(['b', 'a', 'c'])
    expect(result.current.isSaving).toBe(false)
    unmount()
    expect(listeners[1].unsubscribe).toHaveBeenCalledOnce()
  })

  it('clears order on sign-out and reloads preferences on signing back into the same account', () => {
    const initialProps: { uid: string | undefined } = { uid: 'user-a' }
    const { result, rerender } = renderHook(({ uid }: { uid: string | undefined }) => useWorkingFileOrder(uid, files), {
      initialProps,
    })
    act(() => listeners[0].onData(['b']))
    rerender({ uid: undefined })
    expect(result.current.orderedFiles).toEqual([])
    expect(result.current.canReorder).toBe(false)
    rerender({ uid: 'user-a' })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.canReorder).toBe(false)
    act(() => listeners[1].onData(['c']))
    expect(ids(result.current.orderedFiles)).toEqual(['c', 'a', 'b'])
  })

  it('reconciles file creation, deletion and renaming without writing preferences', () => {
    const { result, rerender } = renderHook(({ currentFiles }) => useWorkingFileOrder('user-a', currentFiles), {
      initialProps: { currentFiles: files },
    })
    act(() => listeners[0].onData(['c', 'b', 'a']))
    rerender({ currentFiles: [{ ...files[1], fileName: 'Renamed' }, files[0], { ...files[2], id: 'new' }] })
    expect(ids(result.current.orderedFiles)).toEqual(['b', 'a', 'new'])
    expect(result.current.orderedFiles[0].fileName).toBe('Renamed')
    expect(saveWorkingFileOrder).not.toHaveBeenCalled()
  })
})
