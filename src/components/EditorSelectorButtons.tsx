import { Button } from '@mui/material'

import { useAppContext } from '../context/AppContext'
import { useFirestoreSettings } from '../hooks/useFirestoreSettings'
import { BTN_VARIANT_CONTAINED, BTN_VARIANT_OUTLINED, EDITOR_OPTION_AMP, EDITOR_OPTION_HTML, EDITOR_OPTION_TEXT } from '../utils/constants'

type EditorType = typeof EDITOR_OPTION_HTML | typeof EDITOR_OPTION_TEXT | typeof EDITOR_OPTION_AMP

const EditorSelectorButtons = () => {
  const { settings } = useAppContext()
  const { updateSetting } = useFirestoreSettings()

  const handleClick = async (editorType: EditorType) => {
    await updateSetting('activeEditor', editorType, 'EditorSelectorButtons')
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
