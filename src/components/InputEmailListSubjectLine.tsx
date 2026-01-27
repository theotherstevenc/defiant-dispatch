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
  const { isPreventThreadingEnabled, subject, setSubject, emailAddresses, setEmailAddresses } = useAppContext()
  const [sizes, setSizes] = usePersistentValue(
    INPUT_EMAIL_LIST_SUBJECT_LINE_SPLIT_SIZES_STORAGE_KEY,
    INPUT_EMAIL_LIST_SUBJECT_LINE_SPLIT_SIZES_DEFAULT
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value)
  }

  const handleBlur = async () => {
    try {
      const firestoreObj = { subject }
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
    } catch (error) {
      logError('Error updating subject in Firestore', 'InputEmailListSubjectLine', error)
    }
  }

  const handleEmailAddressesChange = async (newEmailAddresses: string[]) => {
    try {
      const firestoreObj = { emailAddresses: newEmailAddresses }
      setEmailAddresses(newEmailAddresses)
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
    } catch (error) {
      logError('Error updating email addresses in Firestore', 'InputEmailListSubjectLine', error)
    }
  }

  return (
    <>
      <Box className='split-container'>
        <Split className='split-component' sizes={sizes} onDragEnd={setSizes}>
          <InputChips chipValues={emailAddresses} setChipValues={setEmailAddresses} onChange={handleEmailAddressesChange} />
          <TextField
            id='subject'
            className='full-height'
            variant='outlined'
            label={isPreventThreadingEnabled ? SUBJECT_LINE_INPUT_LABEL_NON_THREADED : SUBJECT_LINE_INPUT_LABEL}
            value={subject}
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
