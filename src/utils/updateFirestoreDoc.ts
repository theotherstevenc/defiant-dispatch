import { doc, setDoc, Firestore } from 'firebase/firestore'

export const updateFirestoreDoc = async (db: Firestore, collection: string, document: string, firestoreObj: object) => {
  const docRef = doc(db, collection, document)
  await setDoc(docRef, firestoreObj, { merge: true })
}
