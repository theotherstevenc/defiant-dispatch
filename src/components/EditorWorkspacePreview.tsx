import { Editor } from '@monaco-editor/react'
import { Box } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import Split from 'react-split'

import { useEditorConfigContext } from '../context/EditorConfigContext'
import { useEditorContext } from '../context/EditorContext'
import { useThemeSettingsContext } from '../context/ThemeSettingsContext'
import { db } from '../firebase'
import { workspaceEditorStyles, workspacePreviewIframeStyles } from '../styles/global.styles'
import {
  EDITOR_DARK_MODE,
  EDITOR_LIGHT_MODE,
  EDITOR_OPTION_AMP,
  EDITOR_OPTION_HTML,
  EDITOR_OPTION_TEXT,
  EDITOR_WORKSPACE_PREVIEW_SPLIT_SIZES_DEFAULT,
  EDITOR_WORKSPACE_PREVIEW_SPLIT_SIZES_STORAGE_KEY,
  FIRESTORE_COLLECTION_WORKING_FILES,
  MOSAIC_OPTION_OFF,
  MOSAIC_OPTION_ON,
} from '../utils/constants'
import forceIframeReflow from '../utils/forceIframeReflow'
import getSanitizedValue from '../utils/getSanitizedValue'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'
import { useRenderCount } from '../utils/useRenderCount'
import usePersistentValue from '../utils/usePersistentValue'

const EditorWorkspacePreview = () => {
  useRenderCount('EditorWorkspacePreview')
  const { html, setHtml, text, setText, amp, setAmp, workingFileID, deletedWorkingFileID, files, editorFontSize } = useEditorContext()
  const { isDarkMode, isPreviewDarkMode } = useThemeSettingsContext()
  const { isMinifyEnabled, isWordWrapEnabled, activeEditor } = useEditorConfigContext()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [sizes, setSizes] = usePersistentValue(EDITOR_WORKSPACE_PREVIEW_SPLIT_SIZES_STORAGE_KEY, EDITOR_WORKSPACE_PREVIEW_SPLIT_SIZES_DEFAULT)

  const handleHtmlChange = useCallback((newValue: string | undefined) => setHtml(newValue || ''), [setHtml])
  const handleTextChange = useCallback((newValue: string | undefined) => setText(newValue || ''), [setText])
  const handleAmpChange = useCallback((newValue: string | undefined) => setAmp(newValue || ''), [setAmp])

  const editors = useMemo(
    () => [
      { type: EDITOR_OPTION_HTML, language: 'html', value: html, onChange: handleHtmlChange },
      { type: EDITOR_OPTION_TEXT, language: 'text', value: text, onChange: handleTextChange },
      { type: EDITOR_OPTION_AMP, language: 'html', value: amp, onChange: handleAmpChange },
    ],
    [html, text, amp, handleHtmlChange, handleTextChange, handleAmpChange]
  )

  // Restore content from files when the editor is empty (initial load / file switch)
  useEffect(() => {
    if (!workingFileID || !files || files.length === 0) {
      return
    }

    const isEditorContentEmpty = html === '' && text === '' && amp === ''

    if (!isEditorContentEmpty) {
      return
    }

    const currentFile = files.find((file) => file.id === workingFileID)

    if (!currentFile) {
      return
    }

    setHtml(currentFile.html)
    setText(currentFile.text)
    setAmp(currentFile.amp)
  }, [html, text, amp, files, workingFileID, setHtml, setText, setAmp])

  // Debounce save content to Firestore after typing stops
  useEffect(() => {
    if (!workingFileID || workingFileID === deletedWorkingFileID) {
      return
    }

    const isEditorContentEmpty = html === '' && text === '' && amp === ''

    if (isEditorContentEmpty) {
      return
    }

    const firestoreObj = { html, text, amp }
    const DEBOUNCE_DELAY = 2000

    const debounceSave = setTimeout(async () => {
      try {
        await updateFirestoreDoc(db, FIRESTORE_COLLECTION_WORKING_FILES, workingFileID, firestoreObj)
      } catch (error) {
        logError('Error auto updating Firestore', 'EditorWorkspacePreview', error)
      }
    }, DEBOUNCE_DELAY)

    return () => {
      clearTimeout(debounceSave)
    }
  }, [html, text, amp, workingFileID, deletedWorkingFileID])

  const editorOptions = useMemo(
    () => ({
      fontSize: editorFontSize,
      readOnly: isMinifyEnabled,
      wordWrap: isWordWrapEnabled ? MOSAIC_OPTION_ON : MOSAIC_OPTION_OFF,
      lineNumbers: MOSAIC_OPTION_ON as const,
      minimap: { enabled: false },
    }),
    [editorFontSize, isMinifyEnabled, isWordWrapEnabled]
  )

  const handleDragEnd = (newSizes: number[]) => {
    setSizes(newSizes)
    forceIframeReflow(iframeRef.current)
  }

  return (
    <Box sx={workspaceEditorStyles}>
      <Split className='split-component' sizes={sizes} onDragEnd={handleDragEnd}>
        <Box>
          {editors.map(
            (editor) =>
              activeEditor === editor.type && (
                <Editor
                  theme={isDarkMode ? EDITOR_DARK_MODE : EDITOR_LIGHT_MODE}
                  key={editor.type}
                  defaultLanguage={editor.language}
                  defaultValue={editor.value}
                  value={editor.value}
                  onChange={editor.onChange}
                  options={editorOptions}
                />
              )
          )}
        </Box>
        <Box>
          {editors.map((editor) => {
            return (
              activeEditor === editor.type && (
                <iframe
                  ref={iframeRef}
                  style={workspacePreviewIframeStyles(isPreviewDarkMode)}
                  key={editor.type}
                  srcDoc={getSanitizedValue(editor)}
                />
              )
            )
          })}
        </Box>
      </Split>
    </Box>
  )
}
export default EditorWorkspacePreview
