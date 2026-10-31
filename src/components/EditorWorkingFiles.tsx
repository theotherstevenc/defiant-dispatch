import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardCode,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Alert, Box, Button, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAuthContext } from '../context/AuthContext'
import { useEditorContext } from '../context/EditorContext'
import { subscribeToWorkingFiles } from '../services/workingFilesService'
import { visuallyHiddenStyles } from '../styles/global.styles'
import {
  WORKING_FILES_DRAG_CANCELLED,
  WORKING_FILES_DRAG_ENDED,
  WORKING_FILES_DRAG_INSTRUCTIONS,
  WORKING_FILES_DRAG_OVER,
  WORKING_FILES_DRAG_STARTED,
  WORKING_FILES_LABEL,
  WORKING_FILES_LOADING,
  WORKING_FILES_RETRY_LABEL,
} from '../utils/constants'
import { logError } from '../utils/logError'
import { useRenderCount } from '../utils/useRenderCount'
import { useWorkingFileOrder } from '../utils/useWorkingFileOrder'

import SortableWorkingFile from './SortableWorkingFile'
import WorkingFileDragPreview from './WorkingFileDragPreview'

import type { WorkingFile } from '../interfaces'
import type { CollisionDetection, DragEndEvent, DragStartEvent, Modifier } from '@dnd-kit/core'

const collisionDetection: CollisionDetection = (args) => (args.pointerCoordinates ? pointerWithin(args) : closestCenter(args))
const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 })
const dragOverlayModifiers = [restrictToVerticalAxis]
const dragOverlayStyle = { pointerEvents: 'none' } as const

const EditorWorkingFiles = () => {
  useRenderCount('EditorWorkingFiles')
  const { setHtml, setText, setAmp, workingFileID, setWorkingFileID, setWorkingFileName, files, setFiles, setIsFileLocked } = useEditorContext()
  const { user } = useAuthContext()
  const uid = user?.uid
  const { orderedFiles, canReorder, isLoading, isSaving, error, hasLoadError, announcement, moveFile, retryLoading } = useWorkingFileOrder(uid, files)
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null)
  const draggedFile = orderedFiles.find((file) => file.id === draggedFileId)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: [KeyboardCode.Space],
        cancel: [KeyboardCode.Esc],
        end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab],
      },
    })
  )

  const handleClick = (file: WorkingFile) => {
    setHtml(file.html)
    setText(file.text)
    setAmp(file.amp)
    setWorkingFileID(file.id)
    setWorkingFileName(file.fileName)
    setIsFileLocked(file.isFileLocked || false)
  }

  useEffect(() => {
    if (!uid) return
    let isActive = true
    const unsubscribe = subscribeToWorkingFiles(
      (workingFiles) => {
        if (isActive) setFiles(workingFiles)
      },
      (error) => logError('An error occurred while fetching working files', 'EditorWorkingFiles', error)
    )
    return () => {
      isActive = false
      unsubscribe()
    }
  }, [uid, setFiles])

  useEffect(() => {
    const currentFile = files.find((file) => file.id === workingFileID)
    setIsFileLocked(currentFile?.isFileLocked || false)
  }, [files, workingFileID, setIsFileLocked])

  const handleDragStart = ({ active }: DragStartEvent) => setDraggedFileId(String(active.id))
  const handleDragCancel = () => setDraggedFileId(null)
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggedFileId(null)
    if (!over || active.id === over.id) return
    const destination = orderedFiles.findIndex((file) => file.id === over.id)
    void moveFile(String(active.id), destination)
  }

  return (
    <Box sx={{ p: 0.5, minWidth: 0 }} className='editor-working-files'>
      {isLoading && (
        <Typography variant='caption' aria-hidden='true'>
          {WORKING_FILES_LOADING}
        </Typography>
      )}
      <Box role='status' aria-live='polite' aria-atomic='true' sx={visuallyHiddenStyles}>
        {announcement || (isLoading ? WORKING_FILES_LOADING : '')}
      </Box>
      {error && (
        <Alert severity='error' sx={{ overflowWrap: 'anywhere' }}>
          {error}
          {hasLoadError && (
            <Button onClick={retryLoading} disabled={isSaving} sx={{ minHeight: 44 }}>
              {WORKING_FILES_RETRY_LABEL}
            </Button>
          )}
        </Alert>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        accessibility={{
          screenReaderInstructions: { draggable: WORKING_FILES_DRAG_INSTRUCTIONS },
          announcements: {
            onDragStart: ({ active }) => `${orderedFiles.find((file) => file.id === active.id)?.fileName}. ${WORKING_FILES_DRAG_STARTED}`,
            onDragOver: ({ over }) =>
              over ? `${WORKING_FILES_DRAG_OVER} ${orderedFiles.findIndex((file) => file.id === over.id) + 1}.` : WORKING_FILES_DRAG_CANCELLED,
            onDragEnd: () => WORKING_FILES_DRAG_ENDED,
            onDragCancel: () => WORKING_FILES_DRAG_CANCELLED,
          },
        }}>
        <SortableContext items={orderedFiles.map((file) => file.id)} strategy={verticalListSortingStrategy}>
          <Box
            component='ul'
            aria-label={WORKING_FILES_LABEL}
            aria-busy={isSaving}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, listStyle: 'none', p: 0, m: 0 }}>
            {orderedFiles.map((file, index) => (
              <SortableWorkingFile
                key={file.id}
                file={file}
                index={index}
                total={orderedFiles.length}
                isSelected={workingFileID === file.id}
                canReorder={canReorder && orderedFiles.length > 1}
                onSelect={handleClick}
                onMove={moveFile}
              />
            ))}
          </Box>
        </SortableContext>
        {createPortal(
          <DragOverlay modifiers={dragOverlayModifiers} dropAnimation={null} style={dragOverlayStyle} zIndex={0}>
            {draggedFile && <WorkingFileDragPreview file={draggedFile} isSelected={workingFileID === draggedFile.id} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </Box>
  )
}
export default EditorWorkingFiles
