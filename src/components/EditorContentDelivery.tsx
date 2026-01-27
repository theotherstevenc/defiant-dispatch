import { Box } from '@mui/material'

import { EditorSelectorButtons, EditorSendButton, InputEmailListSubjectLine } from '../components'
import { editorActionsStyles } from '../styles/global.styles'

const EditorContentDelivery = () => (
  <Box sx={editorActionsStyles}>
    <EditorSelectorButtons />
    <InputEmailListSubjectLine />
    <EditorSendButton />
  </Box>
)
export default EditorContentDelivery
