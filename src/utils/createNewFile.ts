import { addDoc, collection } from 'firebase/firestore'

import { db } from '../firebase'

import { logError } from './logError'

export const createNewFile = async (
  fileName: string,
  boilerPlateMarkup: { html: string; text: string; amp: string },
  isBoilerplateApplied: boolean,
  setWorkingFileID: (id: string) => void,
  setWorkingFileName: (name: string) => void,
  setHtml: (html: string) => void,
  setText: (text: string) => void,
  setAmp: (amp: string) => void,
  setIsFileLocked: (isFileLocked: boolean) => void
) => {
  try {
    const requestBody: { fileName: string; boilerPlateMarkup?: string } = { fileName }

    if (isBoilerplateApplied) {
      requestBody.boilerPlateMarkup = JSON.stringify(boilerPlateMarkup)
    }

    const reqFileName = requestBody.fileName
    const reqBoilerPlateMarkup = requestBody.boilerPlateMarkup

    let parsedBoilerPlateMarkup: { html?: string; text?: string; amp?: string } = {}

    if (reqBoilerPlateMarkup) {
      try {
        parsedBoilerPlateMarkup = JSON.parse(reqBoilerPlateMarkup)
      } catch (error) {
        logError('Error parsing data', 'createNewFile', error)
      }
    }

    const newFileData = {
      fileName: reqFileName,
      html: parsedBoilerPlateMarkup.html || '',
      text: parsedBoilerPlateMarkup.text || '',
      amp: parsedBoilerPlateMarkup.amp || '',
      createdAt: new Date().toISOString(),
      isFileLocked: false, // Default value for new files
    }

    const newFileRef = await addDoc(collection(db, 'workingFiles'), newFileData)

    setWorkingFileID(newFileRef.id)
    setWorkingFileName(newFileData.fileName)
    setHtml(newFileData.html || '')
    setText(newFileData.text || '')
    setAmp(newFileData.amp || '')
    setIsFileLocked(false) // Ensure the file is not locked when created
  } catch (error) {
    logError('Error creating new file', 'createNewFile', error)
    return false
  }
}
