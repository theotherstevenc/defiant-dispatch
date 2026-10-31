import { useEffect, useMemo, useRef, useState } from 'react'

import { saveWorkingFileOrder, subscribeToWorkingFileOrder } from '../services/workingFilePreferencesService'

import {
  WORKING_FILES_LOAD_ERROR,
  WORKING_FILES_POSITION_MESSAGE,
  WORKING_FILES_SAVED,
  WORKING_FILES_SAVE_ERROR,
  WORKING_FILES_SAVING,
} from './constants'
import { logError } from './logError'
import { moveWorkingFile, orderWorkingFiles } from './workingFileOrder'

import type { WorkingFile } from '../interfaces'

interface OrderState {
  uid: string | null
  order: string[]
  isLoading: boolean
  isSaving: boolean
  error: 'load' | 'save' | null
  announcement: string
}

interface OrderSession {
  isActive: boolean
  uid: string
  confirmedOrder: string[]
  snapshotVersion: number
  hasLoaded: boolean
  hasError: boolean
  isSaving: boolean
}

interface WorkingFileOrderResult {
  orderedFiles: WorkingFile[]
  canReorder: boolean
  isLoading: boolean
  isSaving: boolean
  error: string | null
  hasLoadError: boolean
  announcement: string
  moveFile: (id: string, destination: number) => Promise<void>
  retryLoading: () => void
}

export const useWorkingFileOrder = (uid: string | undefined, files: WorkingFile[]): WorkingFileOrderResult => {
  const [state, setState] = useState<OrderState>({
    uid: uid ?? null,
    order: [],
    isLoading: true,
    isSaving: false,
    error: null,
    announcement: '',
  })
  const [retry, setRetry] = useState(0)
  const sessionRef = useRef<OrderSession | null>(null)

  if (state.uid !== (uid ?? null)) {
    setState({
      uid: uid ?? null,
      order: [],
      isLoading: true,
      isSaving: false,
      error: null,
      announcement: '',
    })
  }

  useEffect(() => {
    if (!uid) return

    const session: OrderSession = {
      uid,
      isActive: true,
      confirmedOrder: [],
      snapshotVersion: 0,
      hasLoaded: false,
      hasError: false,
      isSaving: false,
    }
    sessionRef.current = session
    const unsubscribe = subscribeToWorkingFileOrder(
      uid,
      (order) => {
        if (!session.isActive) return
        session.confirmedOrder = order
        session.snapshotVersion += 1
        session.hasLoaded = true
        session.hasError = false
        setState((previous) => ({
          uid,
          order: session.isSaving ? previous.order : order,
          isLoading: false,
          isSaving: session.isSaving,
          error: previous.uid === uid && previous.error === 'save' ? 'save' : null,
          announcement: previous.uid === uid ? previous.announcement : '',
        }))
      },
      (error) => {
        if (!session.isActive) return
        session.hasError = true
        logError('Could not load working-file order', 'useWorkingFileOrder', error)
        setState((previous) => ({
          ...previous,
          uid,
          order: session.confirmedOrder,
          isLoading: false,
          isSaving: session.isSaving,
          error: 'load',
          announcement: '',
        }))
      }
    )

    return () => {
      session.isActive = false
      sessionRef.current = null
      unsubscribe()
    }
  }, [uid, retry])

  const isCurrentUser = state.uid === uid
  const orderedFiles = useMemo(
    () => (uid ? orderWorkingFiles(files, state.uid === uid ? state.order : []) : []),
    [uid, files, state.uid, state.order]
  )
  const isLoading = Boolean(uid) && (!isCurrentUser || state.isLoading)
  const isSaving = isCurrentUser && state.isSaving
  const hasLoadError = isCurrentUser && state.error === 'load'
  const canReorder = Boolean(uid) && !isLoading && !isSaving && !hasLoadError

  const moveFile = async (id: string, destination: number): Promise<void> => {
    const session = sessionRef.current
    if (!canReorder || !session?.isActive || session.uid !== uid || !session.hasLoaded || session.hasError || session.isSaving) return

    const moved = moveWorkingFile(orderedFiles, id, destination)
    if (moved === orderedFiles) return

    const nextOrder = moved.map((file) => file.id)
    const file = moved[destination]
    const positionMessage = WORKING_FILES_POSITION_MESSAGE(file.fileName, destination + 1, moved.length)
    const snapshotVersion = session.snapshotVersion
    session.isSaving = true
    setState((previous) => ({
      ...previous,
      order: nextOrder,
      isSaving: true,
      error: null,
      announcement: `${positionMessage} ${WORKING_FILES_SAVING}`,
    }))

    try {
      await saveWorkingFileOrder(session.uid, nextOrder)
      if (!session.isActive) return

      // The write promise can settle before its metadata-only confirmation snapshot.
      if (session.snapshotVersion === snapshotVersion) session.confirmedOrder = nextOrder
      setState((previous) => ({
        ...previous,
        order: session.confirmedOrder,
        isSaving: false,
        announcement: session.hasError ? '' : WORKING_FILES_SAVED,
      }))
    } catch (error) {
      if (!session.isActive) return
      logError('Could not save working-file order', 'useWorkingFileOrder', error)
      setState((previous) => ({
        ...previous,
        order: session.confirmedOrder,
        isSaving: false,
        error: session.hasError ? 'load' : 'save',
        announcement: '',
      }))
    } finally {
      session.isSaving = false
    }
  }

  const retryLoading = (): void => {
    if (sessionRef.current?.isSaving) return
    setState((previous) => ({ ...previous, isLoading: true, error: null, announcement: '' }))
    setRetry((previous) => previous + 1)
  }

  return {
    orderedFiles,
    canReorder,
    isLoading,
    isSaving,
    hasLoadError,
    error: hasLoadError ? WORKING_FILES_LOAD_ERROR : isCurrentUser && state.error === 'save' ? WORKING_FILES_SAVE_ERROR : null,
    announcement: isCurrentUser ? state.announcement : '',
    moveFile,
    retryLoading,
  }
}
