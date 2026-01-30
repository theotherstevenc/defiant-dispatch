import { TextField } from '@mui/material'

import { useAppContext } from '../context/AppContext'
import { db } from '../firebase'
import { SenderSettings } from '../interfaces'
import { SETTINGS_FROM, SETTINGS_HOST, SETTINGS_PASS, SETTINGS_PORT, SETTINGS_USER } from '../utils/constants'
import { encryptString } from '../utils/encryptString'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

const InputSenderSettings = () => {
  const { settings, dispatch } = useAppContext()

  const handleInputChange = (id: keyof SenderSettings, value: string) => {
    dispatch({
      type: 'SET_SETTINGS',
      payload: {
        [id]: value,
      },
    })
  }

  const handleInput = async (id: string, value: string, isBlur: boolean) => {
    const processedValue = id === 'pass' && isBlur ? await encryptString(value) : value
    handleInputChange(id as keyof SenderSettings, processedValue)

    if (isBlur) {
      const firestoreObj = {
        host: settings.host,
        port: settings.port,
        username: settings.username,
        pass: settings.pass,
        from: settings.from,
        [id]: processedValue,
      }
      try {
        await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
      } catch (error) {
        logError('Error updating Firestore document', 'InputSenderSettings', error)
      }
    }
  }

  const handleEvent = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    isBlur: boolean
  ) => {
    const { id, value } = e.target
    try {
      await handleInput(id, value, isBlur)
    } catch (error) {
      logError('Error handling input event', 'InputSenderSettings', error)
    }
  }

  const textFields = [
    { id: SETTINGS_HOST, type: 'text', sx: {} },
    { id: SETTINGS_PORT, type: 'text', sx: { width: '70px' } },
    { id: SETTINGS_USER, type: 'text', sx: {} },
    { id: SETTINGS_PASS, type: 'password', sx: {} },
    { id: SETTINGS_FROM, type: 'text', sx: {} },
  ]

  return (
    <>
      {textFields.map((field) => (
        <TextField
          key={field.id}
          id={field.id}
          label={field.id}
          type={field.type}
          variant='outlined'
          size='small'
          value={settings[field.id as keyof SenderSettings]}
          onChange={(e) => handleEvent(e, false)}
          onBlur={(e) => handleEvent(e, true)}
          sx={field.sx}
        />
      ))}
    </>
  )
}
export default InputSenderSettings
