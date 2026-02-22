import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'

import { db } from '../firebase'
import { WorkingFile } from '../interfaces'
import { FIRESTORE_COLLECTION_WORKING_FILES } from '../utils/constants'

/** Subscribe to all working files in the Firestore collection. Returns an unsubscribe function. */
export const subscribeToWorkingFiles = (onData: (files: WorkingFile[]) => void, onError: (error: Error) => void) => {
  const workingFilesRef = collection(db, FIRESTORE_COLLECTION_WORKING_FILES)
  return onSnapshot(
    workingFilesRef,
    (snapshot) => {
      const files = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as WorkingFile[]
      onData(files)
    },
    onError
  )
}

/** Create a new working file document. Returns the new document ID. */
export const createWorkingFile = async (data: {
  fileName: string
  html: string
  text: string
  amp: string
  createdAt: string
  isFileLocked: boolean
}): Promise<string> => {
  const ref = await addDoc(collection(db, FIRESTORE_COLLECTION_WORKING_FILES), data)
  return ref.id
}

/** Update fields on an existing working file document (merge). */
export const updateWorkingFile = async (docId: string, data: Record<string, unknown>): Promise<void> => {
  const docRef = doc(db, FIRESTORE_COLLECTION_WORKING_FILES, docId)
  await setDoc(docRef, data, { merge: true })
}

/** Delete a working file document. */
export const deleteWorkingFile = async (docId: string): Promise<void> => {
  const docRef = doc(db, FIRESTORE_COLLECTION_WORKING_FILES, docId)
  await deleteDoc(docRef)
}
