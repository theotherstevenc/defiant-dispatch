import { createWorkingFile } from '../services/workingFilesService'

import { logError } from './logError'

interface CreateNewFileInput {
  fileName: string
  boilerPlateMarkup: { html: string; text: string; amp: string }
  isBoilerplateApplied: boolean
}

interface CreateNewFileResult {
  id: string
  fileName: string
  html: string
  text: string
  amp: string
  isFileLocked: boolean
}

export const createNewFile = async ({
  fileName,
  boilerPlateMarkup,
  isBoilerplateApplied,
}: CreateNewFileInput): Promise<CreateNewFileResult | false> => {
  try {
    const html = isBoilerplateApplied ? boilerPlateMarkup.html : ''
    const text = isBoilerplateApplied ? boilerPlateMarkup.text : ''
    const amp = isBoilerplateApplied ? boilerPlateMarkup.amp : ''

    const newFileData = {
      fileName,
      html,
      text,
      amp,
      createdAt: new Date().toISOString(),
      isFileLocked: false,
    }

    const id = await createWorkingFile(newFileData)

    return {
      id,
      fileName,
      html,
      text,
      amp,
      isFileLocked: false,
    }
  } catch (error) {
    logError('Error creating new file', 'createNewFile', error)
    return false
  }
}
