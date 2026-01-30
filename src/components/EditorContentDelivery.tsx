import { Box } from '@mui/material'

import { editorActionsStyles } from '../styles/global.styles'

import EditorSelectorButtons from './EditorSelectorButtons'
import EditorSendButton from './EditorSendButton'
import InputEmailListSubjectLine from './InputEmailListSubjectLine'

const EditorContentDelivery = () => (
  <Box sx={editorActionsStyles}>
    <EditorSelectorButtons />
    <InputEmailListSubjectLine />
    <EditorSendButton />
  </Box>
)
export default EditorContentDelivery
