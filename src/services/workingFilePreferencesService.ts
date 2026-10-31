import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { z } from 'zod'

import { db } from '../firebase'
import { FIRESTORE_COLLECTION_USER_PREFERENCES } from '../utils/constants'

import type { WorkingFilePreferences } from '../interfaces'

const preferencesSchema = z.object({
  workingFileOrder: z.array(z.string().min(1)).default([]),
})

export const subscribeToWorkingFileOrder = (uid: string, onData: (order: string[]) => void, onError: (error: Error) => void): (() => void) =>
  onSnapshot(
    doc(db, FIRESTORE_COLLECTION_USER_PREFERENCES, uid),
    { includeMetadataChanges: true },
    (snapshot) => {
      // Local writes are optimistic, not confirmed preferences to roll back to.
      if (snapshot.metadata.hasPendingWrites) return

      const result = preferencesSchema.safeParse(snapshot.exists() ? snapshot.data() : {})
      if (!result.success) {
        onError(result.error)
        return
      }
      onData(result.data.workingFileOrder)
    },
    onError
  )

export const saveWorkingFileOrder = async (uid: string, order: string[]): Promise<void> => {
  const preferences: WorkingFilePreferences = { workingFileOrder: order }
  await setDoc(doc(db, FIRESTORE_COLLECTION_USER_PREFERENCES, uid), preferences, { merge: true })
}
