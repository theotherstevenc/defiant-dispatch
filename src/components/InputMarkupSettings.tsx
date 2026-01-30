/* eslint-disable react-hooks/exhaustive-deps */
import { Checkbox, FormControlLabel } from '@mui/material'
import { useEffect } from 'react'

import { useAppContext } from '../context/AppContext'
import { useEditorContext } from '../context/EditorContext'
import { db } from '../firebase'
import { SETTINGS_CHECKBOX_LABEL_MINIFY, SETTINGS_CHECKBOX_LABEL_PREVENT_THREADING, SETTINGS_CHECKBOX_LABEL_WORD_WRAP } from '../utils/constants'
import { customMinifier } from '../utils/customMinifier'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

const InputMarkupSettings = () => {
  const { setHtml, html, setOriginalHtml, originalHtml } = useEditorContext()
  const { settings, dispatch } = useAppContext()

  const settingsConfig = [
    { name: 'isMinifyEnabled', label: SETTINGS_CHECKBOX_LABEL_MINIFY, checked: settings.isMinifyEnabled },
    { name: 'isWordWrapEnabled', label: SETTINGS_CHECKBOX_LABEL_WORD_WRAP, checked: settings.isWordWrapEnabled },
    {
      name: 'isPreventThreadingEnabled',
      label: SETTINGS_CHECKBOX_LABEL_PREVENT_THREADING,
      checked: settings.isPreventThreadingEnabled,
    },
  ]

  const COLLECTION = 'config'
  const DOCUMENT = 'editorSettings'

  const handleChange = async (event: React.SyntheticEvent, checked: boolean) => {
    const target = event.target as HTMLInputElement
    const { name } = target

    // Update the UI first
    dispatch({
      type: 'UPDATE_SETTING',
      key: name as keyof typeof settings,
      value: checked,
    })

    const firestoreObj = { [name]: checked }

    try {
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
    } catch (error) {
      logError('Error updating Firestore document', 'InputMarkupSettings', error)
    }
  }

  const updateHtml = () => {
    if (settings.isMinifyEnabled) {
      setOriginalHtml(html)
      setHtml(customMinifier(html))
    } else {
      setHtml(originalHtml)
    }
  }

  useEffect(() => {
    updateHtml()
  }, [settings.isMinifyEnabled])

  return (
    <>
      {settingsConfig.map(({ name, label, checked }) => (
        <FormControlLabel key={name} control={<Checkbox name={name} color='primary' />} label={label} checked={checked} onChange={handleChange} />
      ))}
    </>
  )
}
export default InputMarkupSettings
