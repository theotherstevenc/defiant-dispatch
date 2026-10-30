import CodeIcon from '@mui/icons-material/Code'
import beautify from 'js-beautify'

import { useEditorConfigContext } from '../context/EditorConfigContext'
import { useEditorContext } from '../context/EditorContext'
import { INPUT_FORMAT_HTML_LABEL } from '../utils/constants'
import { logError } from '../utils/logError'

import EditorActionButton from './EditorActionButton'

import type { EditorActionProps } from '../interfaces'

const InputFormatHTML = (props: EditorActionProps) => {
  const { html, setHtml } = useEditorContext()
  const { isMinifyEnabled } = useEditorConfigContext()

  const handleClick = async () => {
    if (isMinifyEnabled) {
      logError('Formatting is disabled when minification is enabled', 'InputFormatHTML')
      return
    }
    try {
      const formattedHtml = beautify.html(html, {
        indent_size: 1,
        max_preserve_newlines: 1,
        preserve_newlines: true,
        wrap_line_length: 120,
      })

      setHtml(formattedHtml)
    } catch (error) {
      logError('Failed to format HTML:', 'InputFormatHTML', error)
    }
  }
  return (
    <EditorActionButton {...props} onClick={handleClick} label={INPUT_FORMAT_HTML_LABEL}>
      <CodeIcon />
    </EditorActionButton>
  )
}
export default InputFormatHTML
