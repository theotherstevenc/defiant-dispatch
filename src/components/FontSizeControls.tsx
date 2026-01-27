import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import TextDecreaseIcon from '@mui/icons-material/TextDecrease'
import TextIncreaseIcon from '@mui/icons-material/TextIncrease'
import { Tooltip } from '@mui/material'

import { useEditorContext } from '../context/EditorContext'
import {
  EDITOR_DECREASE_FONT_SIZE_LABEL,
  EDITOR_DEFAULT_FONT_SIZE,
  EDITOR_INCREASE_FONT_SIZE_LABEL,
  EDITOR_RESET_FONT_SIZE_LABEL,
} from '../utils/constants'

import { StyledIconButton } from './StyledIconButton'

const FontSizeControls = () => {
  const { editorFontSize, setEditorFontSize } = useEditorContext()

  const increase = () => setEditorFontSize(editorFontSize + 1)
  const decrease = () => setEditorFontSize(editorFontSize - 1)
  const reset = () => setEditorFontSize(EDITOR_DEFAULT_FONT_SIZE)

  return (
    <>
      <Tooltip title={EDITOR_INCREASE_FONT_SIZE_LABEL}>
        <StyledIconButton onClick={increase} aria-label={EDITOR_INCREASE_FONT_SIZE_LABEL}>
          <TextIncreaseIcon />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title={EDITOR_RESET_FONT_SIZE_LABEL}>
        <StyledIconButton onClick={reset} aria-label={EDITOR_RESET_FONT_SIZE_LABEL}>
          <SettingsBackupRestoreIcon />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title={EDITOR_DECREASE_FONT_SIZE_LABEL}>
        <StyledIconButton onClick={decrease} aria-label={EDITOR_DECREASE_FONT_SIZE_LABEL}>
          <TextDecreaseIcon />
        </StyledIconButton>
      </Tooltip>
    </>
  )
}

export default FontSizeControls
