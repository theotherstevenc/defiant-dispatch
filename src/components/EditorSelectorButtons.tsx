import { Button } from '@mui/material'

import { useAppContext } from '../context/AppContext'
import { db } from '../firebase'
import { BTN_VARIANT_CONTAINED, BTN_VARIANT_OUTLINED, EDITOR_OPTION_AMP, EDITOR_OPTION_HTML, EDITOR_OPTION_TEXT } from '../utils/constants'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

type EditorType = typeof EDITOR_OPTION_HTML | typeof EDITOR_OPTION_TEXT | typeof EDITOR_OPTION_AMP

const EditorSelectorButtons = () => {
  const { settings, dispatch } = useAppContext()

  const handleClick = async (editorType: EditorType) => {
    const firestoreObj = { activeEditor: editorType }

    try {
      dispatch({ type: 'UPDATE_SETTING', key: 'activeEditor', value: editorType })
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
    } catch (error) {
      logError('Unable to set active editor', 'EditorSelectorButtons', error)
    }
  }

  const editorOptions: EditorType[] = [EDITOR_OPTION_HTML, EDITOR_OPTION_TEXT, EDITOR_OPTION_AMP]

  return (
    <>
      {editorOptions.map((editorOption) => {
        return (
          <Button
            key={editorOption}
            variant={settings.activeEditor === editorOption ? BTN_VARIANT_CONTAINED : BTN_VARIANT_OUTLINED}
            onClick={() => handleClick(editorOption)}>
            {editorOption.toUpperCase()}
          </Button>
        )
      })}
    </>
  )
}

export default EditorSelectorButtons
