import * as firestore from 'firebase/firestore'
import { describe, it, expect, vi } from 'vitest'

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
}))

import { updateFirestoreDoc } from '../updateFirestoreDoc'

describe('updateFirestoreDoc', () => {
  it('calls doc and setDoc with correct arguments', async () => {
    const fakeDb = {} as firestore.Firestore
    const collection = 'testCollection'
    const document = 'testDocument'
    const firestoreObj = { name: 'testObject' }

    const fakeDocRef = { id: 'fakeDocRef' }
    // @ts-expect-error: we're mocking
    firestore.doc.mockReturnValue(fakeDocRef)
    // @ts-expect-error: we're mocking
    firestore.setDoc.mockResolvedValue(undefined)

    await updateFirestoreDoc(fakeDb, collection, document, firestoreObj)

    expect(firestore.doc).toHaveBeenCalledWith(fakeDb, collection, document)
    expect(firestore.setDoc).toHaveBeenCalledWith(fakeDocRef, firestoreObj, { merge: true })
  })
})
