import { Box } from '@mui/material'
import { clsx } from 'clsx'
import { useEffect, useRef } from 'react'
import Split from 'react-split'

import { useAppContext } from '../context/AppContext'
import {
  EDITOR_CONTAINER_SPLIT_SIZES_DEFAULT,
  EDITOR_CONTAINER_SPLIT_SIZES_MINIMUM,
  EDITOR_CONTAINER_SPLIT_SIZES_STORAGE_KEY,
  EDITOR_SPLIT_COLLAPSE_THRESHOLD,
  EDITOR_SPLIT_COLLAPSED_STATE,
} from '../utils/constants'
import usePersistentValue from '../utils/usePersistentValue'

import EditorWorkingFiles from './EditorWorkingFiles'
import EditorWorkspacePreview from './EditorWorkspacePreview'

type SplitSizes = [number, number]

const EditorContainer = () => {
  const { dispatch, settings } = useAppContext()

  const [sizes, setSizes] = usePersistentValue<SplitSizes>(EDITOR_CONTAINER_SPLIT_SIZES_STORAGE_KEY, EDITOR_CONTAINER_SPLIT_SIZES_DEFAULT)
  const prevHideWorkingFilesRef = useRef(settings.hideWorkingFiles)

  // Derive collapsed state from sizes (single source of truth)
  // Only consider it collapsed if it's actually at 0, not just below threshold
  const isCollapsed = sizes[0] === 0

  // Sync to AppContext whenever collapsed state changes from drag operations
  useEffect(() => {
    dispatch({ type: 'UPDATE_SETTING', key: 'hideWorkingFiles', value: isCollapsed })
  }, [isCollapsed, dispatch])

  // Sync sizes when hideWorkingFiles changes from external sources (like toggle button)
  useEffect(() => {
    // Only respond if hideWorkingFiles actually changed (not from drag operations updating it)
    if (prevHideWorkingFilesRef.current === settings.hideWorkingFiles) {
      return
    }
    
    prevHideWorkingFilesRef.current = settings.hideWorkingFiles
    
    const shouldBeCollapsed = settings.hideWorkingFiles
    const currentlyCollapsed = sizes[0] === 0

    // Only update if there's a mismatch
    if (shouldBeCollapsed && !currentlyCollapsed) {
      setSizes(EDITOR_SPLIT_COLLAPSED_STATE)
    } else if (!shouldBeCollapsed && currentlyCollapsed) {
      setSizes(EDITOR_CONTAINER_SPLIT_SIZES_DEFAULT)
    }
  }, [settings.hideWorkingFiles, sizes, setSizes])

  const handleDrag = (newSizes: SplitSizes) => {
    setSizes(newSizes)
  }

  const handleDragEnd = (newSizes: SplitSizes) => {
    const willCollapse = newSizes[0] < EDITOR_SPLIT_COLLAPSE_THRESHOLD
    setSizes(willCollapse ? EDITOR_SPLIT_COLLAPSED_STATE : newSizes)
  }

  const workingFilesClassName = clsx({
    'no-working-files': isCollapsed,
    'warn-collapse': sizes[0] < EDITOR_SPLIT_COLLAPSE_THRESHOLD && !isCollapsed,
  })

  return (
    <Split className='split-component' sizes={sizes} minSize={EDITOR_CONTAINER_SPLIT_SIZES_MINIMUM} onDragEnd={handleDragEnd} onDrag={handleDrag}>
      <Box className={workingFilesClassName}>
        <EditorWorkingFiles />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <EditorWorkspacePreview />
      </Box>
    </Split>
  )
}

export default EditorContainer
