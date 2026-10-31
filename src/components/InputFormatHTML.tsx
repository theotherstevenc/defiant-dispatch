import CodeIcon from '@mui/icons-material/Code'
import { Alert, Snackbar } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

import { useEditorConfigContext } from '../context/EditorConfigContext'
import { useEditorContext } from '../context/EditorContext'
import { INPUT_FORMAT_HTML_ERROR, INPUT_FORMAT_HTML_LABEL } from '../utils/constants'
import { logError } from '../utils/logError'

import EditorActionButton from './EditorActionButton'

import type { EditorActionProps } from '../interfaces'
import type { ReactElement } from 'react'

const InputFormatHTML = (props: EditorActionProps): ReactElement => {
  const { html, setHtml, workingFileID } = useEditorContext()
  const { isMinifyEnabled } = useEditorConfigContext()
  const [hasError, setHasError] = useState(false)
  const request = useRef(0)

  useEffect(
    () => () => {
      request.current += 1
    },
    [html, workingFileID, isMinifyEnabled]
  )

  const handleClick = async () => {
    if (isMinifyEnabled) {
      logError('Formatting is disabled when minification is enabled', 'InputFormatHTML')
      return
    }
    const requestId = ++request.current
    setHasError(false)
    try {
      const { default: beautify } = await import('js-beautify')
      if (requestId !== request.current) return

      const formattedHtml = beautify.html(html, {
        indent_size: 1,
        max_preserve_newlines: 1,
        preserve_newlines: true,
        wrap_line_length: 120,
      })

      setHtml(formattedHtml)
    } catch (error) {
      logError('Failed to format HTML:', 'InputFormatHTML', error)
      if (requestId === request.current) setHasError(true)
    }
  }
  return (
    <>
      <EditorActionButton {...props} onClick={handleClick} label={INPUT_FORMAT_HTML_LABEL}>
        <CodeIcon />
      </EditorActionButton>
      <Snackbar open={hasError} onClose={() => setHasError(false)}>
        <Alert severity='error'>{INPUT_FORMAT_HTML_ERROR}</Alert>
      </Snackbar>
    </>
  )
}
export default InputFormatHTML
