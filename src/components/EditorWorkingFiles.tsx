/* eslint-disable react-hooks/exhaustive-deps */
import LockIcon from '@mui/icons-material/Lock'
import { Box, Button, Tooltip } from '@mui/material'
import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect } from 'react'

import { useAppContext } from '../context/AppContext'
import { useEditorContext } from '../context/EditorContext'
import { db } from '../firebase'
import { WorkingFile } from '../interfaces'
import { BTN_VARIANT_CONTAINED, BTN_VARIANT_OUTLINED } from '../utils/constants'
import { logError } from '../utils/logError'

const EditorWorkingFiles = () => {
  const { setHtml, setText, setAmp, workingFileID, setWorkingFileID, setWorkingFileName, files, setFiles, setIsFileLocked } = useEditorContext()
  const { user } = useAppContext()

  const handleClick = (file: WorkingFile) => {
    setHtml(file.html)
    setText(file.text)
    setAmp(file.amp)
    setWorkingFileID(file.id)
    setWorkingFileName(file.fileName)
    setIsFileLocked(file.isFileLocked || false)
  }

  useEffect(() => {
    if (!user) return
    const workingFiles = collection(db, 'workingFiles')
    const unsubscribe = onSnapshot(
      workingFiles,
      (snapshot) => {
        const workingFilesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setFiles(workingFilesData as WorkingFile[])
      },
      (error) => {
        logError('An error occurred while fetching working files', 'EditorWorkingFiles', error)
      }
    )
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    const currentFile = files.find((file) => file.id === workingFileID)
    setIsFileLocked(currentFile?.isFileLocked || false)
  }, [files])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, padding: 0.5 }} className='editor-working-files'>
      {files.length > 0 &&
        files.map((file) => (
          <Button
            variant={workingFileID === file.id ? BTN_VARIANT_CONTAINED : BTN_VARIANT_OUTLINED}
            onClick={() => handleClick(file)}
            key={file.id}
            sx={{ justifyContent: 'flex-start', position: 'relative', paddingLeft: 2, paddingRight: 4 }}>
            {file.isFileLocked && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}>
                <LockIcon fontSize='inherit' sx={{ fontSize: 12 }} />
              </Box>
            )}
            <Tooltip
              title={file.fileName}
              arrow
              enterDelay={1500}
              leaveDelay={0}
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#252526',
                    color: '#d4d4d4',
                    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                    fontSize: 13,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    border: '1px solid #333',
                    padding: '6px 12px',
                  },
                },
                arrow: {
                  sx: {
                    color: '#252526',
                  },
                },
              }}>
              <Box
                sx={{
                  width: '100%',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                {file.fileName}
              </Box>
            </Tooltip>
          </Button>
        ))}
    </Box>
  )
}
export default EditorWorkingFiles
