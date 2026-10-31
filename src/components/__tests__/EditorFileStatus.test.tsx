import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { useEffect } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { EditorProvider, useEditorContext } from '../../context/EditorContext'
import EditorFileStatus from '../EditorFileStatus'
import SortableWorkingFile from '../SortableWorkingFile'

const files = [
  { id: '1', fileName: 'A long active file name that needs its full details', html: '<p>Draft</p>', text: '', amp: '', isFileLocked: true },
  { id: '2', fileName: 'Another working file', html: '', text: 'Plain text', amp: '', isFileLocked: false },
]

const StatusFixture = () => {
  const { files: workingFiles, setFiles, workingFileID, setWorkingFileID } = useEditorContext()
  useEffect(() => {
    setFiles(files)
    setWorkingFileID('1')
  }, [setFiles, setWorkingFileID])
  return (
    <>
      <ul>
        {workingFiles.map((file, index) => (
          <SortableWorkingFile
            key={file.id}
            file={file}
            index={index}
            total={workingFiles.length}
            isSelected={file.id === workingFileID}
            canReorder={false}
            onSelect={(file) => setWorkingFileID(file.id)}
            onMove={async () => {}}
          />
        ))}
      </ul>
      <EditorFileStatus />
    </>
  )
}

const renderStatus = (hasFiles = true) => render(<EditorProvider>{hasFiles ? <StatusFixture /> : <EditorFileStatus />}</EditorProvider>)

describe('EditorFileStatus', () => {
  beforeEach(() => localStorage.clear())

  it('shows only the active filename and keeps it unchanged when hovering another file', () => {
    renderStatus()
    const status = screen.getByRole('status')
    const otherFile = screen.getByRole('button', { name: files[1].fileName })
    expect(status.textContent).toBe(files[0].fileName)

    fireEvent.mouseOver(otherFile)

    expect(status.textContent).toBe(files[0].fileName)
    expect(screen.getByRole('button', { name: `${files[0].fileName}, locked`, pressed: true })).toBeInTheDocument()
    fireEvent.mouseOut(otherFile, { relatedTarget: document.body })
    expect(status.textContent).toBe(files[0].fileName)
  })

  it('keeps the status unchanged when another file receives keyboard focus', () => {
    renderStatus()
    const status = screen.getByRole('status')
    const otherFile = screen.getByRole('button', { name: files[1].fileName })
    act(() => otherFile.focus())
    expect(status.textContent).toBe(files[0].fileName)
  })

  it('does not offer a button or open a dialog when clicking the filename', () => {
    renderStatus()
    const status = screen.getByRole('status')

    fireEvent.click(within(status).getByText(files[0].fileName))

    expect(within(status).queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('updates the status when another file is selected', () => {
    renderStatus()
    fireEvent.click(screen.getByRole('button', { name: files[1].fileName }))
    expect(screen.getByRole('status').textContent).toBe(files[1].fileName)
  })

  it('shows an empty state without an action when no working file is selected', () => {
    renderStatus(false)
    expect(screen.getByRole('status')).toHaveTextContent('No working file selected')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
