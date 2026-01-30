import { Box, TextField } from '@mui/material'
import Split from 'react-split'

import { useAppContext } from '../context/AppContext'
import { db } from '../firebase'
import {
  INPUT_EMAIL_LIST_SUBJECT_LINE_SPLIT_SIZES_DEFAULT,
  INPUT_EMAIL_LIST_SUBJECT_LINE_SPLIT_SIZES_STORAGE_KEY,
  SUBJECT_LINE_INPUT_LABEL,
  SUBJECT_LINE_INPUT_LABEL_NON_THREADED,
} from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'
import usePersistentValue from '../utils/usePersistentValue'

import InputChips from './InputChips'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

const InputEmailListSubjectLine = () => {
  const { settings, dispatch } = useAppContext()
  const [sizes, setSizes] = usePersistentValue(
    INPUT_EMAIL_LIST_SUBJECT_LINE_SPLIT_SIZES_STORAGE_KEY,
    INPUT_EMAIL_LIST_SUBJECT_LINE_SPLIT_SIZES_DEFAULT
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_SETTING', key: 'subject', value: e.target.value })
  }

  const handleBlur = async () => {
    try {
      const firestoreObj = { subject: settings.subject }
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
    } catch (error) {
      logError('Error updating subject in Firestore', 'InputEmailListSubjectLine', error)
    }
  }

  const handleEmailAddressesChange = async (newEmailAddresses: string[]) => {
    try {
      const firestoreObj = { emailAddresses: newEmailAddresses }
      dispatch({ type: 'UPDATE_SETTING', key: 'emailAddresses', value: newEmailAddresses })
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
    } catch (error) {
      logError('Error updating email addresses in Firestore', 'InputEmailListSubjectLine', error)
    }
  }

  // Wrapper to handle both value and function updates from InputChips
  const setEmailAddresses = (action: React.SetStateAction<string[]>) => {
    const newValue = typeof action === 'function' ? action(settings.emailAddresses) : action
    dispatch({ type: 'UPDATE_SETTING', key: 'emailAddresses', value: newValue })
  }

  return (
    <>
      <Box className='split-container'>
        <Split className='split-component' sizes={sizes} onDragEnd={setSizes}>
          <InputChips chipValues={settings.emailAddresses} setChipValues={setEmailAddresses} onChange={handleEmailAddressesChange} />
          <TextField
            id='subject'
            className='full-height'
            variant='outlined'
            label={settings.isPreventThreadingEnabled ? SUBJECT_LINE_INPUT_LABEL_NON_THREADED : SUBJECT_LINE_INPUT_LABEL}
            value={settings.subject}
            size='small'
            onBlur={handleBlur}
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '100%',
              },
            }}
          />
        </Split>
      </Box>
    </>
  )
}
export default InputEmailListSubjectLine
