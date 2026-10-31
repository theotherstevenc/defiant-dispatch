import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { saveWorkingFileOrder, subscribeToWorkingFileOrder } from '../../services/workingFilePreferencesService'
import { subscribeToWorkingFiles } from '../../services/workingFilesService'
import {
  WORKING_FILES_LOAD_ERROR,
  WORKING_FILES_RETRY_LABEL,
  WORKING_FILES_SAVED,
  WORKING_FILES_SAVE_ERROR,
  WORKING_FILES_SAVING,
} from '../../utils/constants'
import EditorWorkingFiles from '../EditorWorkingFiles'

const mockSetHtml = vi.fn()
const mockSetText = vi.fn()
const mockSetAmp = vi.fn()
const mockSetWorkingFileID = vi.fn()
const mockSetWorkingFileName = vi.fn()
const mockSetIsFileLocked = vi.fn()
const mockSetFiles = vi.fn()
const files = [
  { id: '1', fileName: 'File One', html: '<h1>one</h1>', text: 'one', amp: '', isFileLocked: false },
  { id: '2', fileName: 'File Two', html: '<h1>two</h1>', text: 'two', amp: '', isFileLocked: true },
]
const unsubscribeFiles = vi.fn()
const unsubscribeOrder = vi.fn()

vi.mock('../../context/EditorContext', () => ({
  useEditorContext: () => ({
    setHtml: mockSetHtml,
    setText: mockSetText,
    setAmp: mockSetAmp,
    workingFileID: '1',
    setWorkingFileID: mockSetWorkingFileID,
    setWorkingFileName: mockSetWorkingFileName,
    files,
    setFiles: mockSetFiles,
    setIsFileLocked: mockSetIsFileLocked,
  }),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({ user: { uid: 'abc' } }),
}))

vi.mock('../../services/workingFilesService', () => ({ subscribeToWorkingFiles: vi.fn() }))
vi.mock('../../services/workingFilePreferencesService', () => ({
  subscribeToWorkingFileOrder: vi.fn(),
  saveWorkingFileOrder: vi.fn(),
}))
vi.mock('../../utils/logError', () => ({ logError: vi.fn() }))

const fileNames = () =>
  within(screen.getByRole('list', { name: 'Working files' }))
    .getAllByRole('listitem')
    .map((row) => row.textContent)

const openMoveMenu = (fileName: string) => {
  const handle = screen.getByRole('button', { name: `Reorder ${fileName}` })
  fireEvent.click(handle)
  return handle
}

const dismissMoveMenu = async () => {
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape', code: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
}

describe('EditorWorkingFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const row = this.closest('li')
      const index = row ? Array.from(row.parentElement?.children ?? []).indexOf(row) : 0
      const top = index * 92
      return { x: 0, y: top, width: 180, height: 88, top, left: 0, right: 180, bottom: top + 88, toJSON: () => ({}) }
    })
    vi.mocked(subscribeToWorkingFiles).mockReturnValue(unsubscribeFiles)
    vi.mocked(subscribeToWorkingFileOrder).mockImplementation((_uid, onData) => {
      onData([])
      return unsubscribeOrder
    })
    vi.mocked(saveWorkingFileOrder).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders file names as buttons', () => {
    render(<EditorWorkingFiles />)
    expect(screen.getByText('File One')).toBeInTheDocument()
    expect(screen.getByText('File Two')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Move (up|down)/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('places the handle before file selection in keyboard order without nesting buttons', () => {
    render(<EditorWorkingFiles />)
    const row = screen.getAllByRole('listitem')[0]
    const handle = within(row).getByRole('button', { name: 'Reorder File One' })
    const select = within(row).getByRole('button', { name: 'File One' })

    expect(within(row).getAllByRole('button')).toEqual([handle, select])
    expect(handle.parentElement).toBe(select.parentElement)
    expect(select).not.toContainElement(handle)
  })

  it('shows lock icon on locked files', () => {
    render(<EditorWorkingFiles />)
    const lockIcons = document.querySelectorAll('[data-testid="LockIcon"]')
    expect(lockIcons.length).toBe(1)
  })

  it('uses contained variant for the active file', () => {
    render(<EditorWorkingFiles />)
    const fileOneButton = screen.getByText('File One').closest('button')
    const fileTwoButton = screen.getByText('File Two').closest('button')
    expect(fileOneButton?.className).toContain('contained')
    expect(fileTwoButton?.className).toContain('outlined')
  })

  it('calls context setters when a file is clicked', () => {
    render(<EditorWorkingFiles />)
    fireEvent.click(screen.getByText('File Two'))
    expect(mockSetHtml).toHaveBeenCalledWith('<h1>two</h1>')
    expect(mockSetText).toHaveBeenCalledWith('two')
    expect(mockSetAmp).toHaveBeenCalledWith('')
    expect(mockSetWorkingFileID).toHaveBeenCalledWith('2')
    expect(mockSetWorkingFileName).toHaveBeenCalledWith('File Two')
    expect(mockSetIsFileLocked).toHaveBeenCalledWith(true)
  })

  it('moves a locked file without selecting it, keeps focus and selection, and announces the result', async () => {
    render(<EditorWorkingFiles />)
    const handle = openMoveMenu('File Two')
    expect(handle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu', { name: 'Reorder File Two' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Move up File Two' }))

    await waitFor(() => expect(fileNames()).toEqual(['File Two', 'File One']))
    expect(document.activeElement).toBe(handle)
    expect(handle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'File One', pressed: true })).toBeInTheDocument()
    expect(mockSetWorkingFileID).not.toHaveBeenCalled()
    expect(mockSetHtml).not.toHaveBeenCalled()
    expect(mockSetText).not.toHaveBeenCalled()
    expect(mockSetAmp).not.toHaveBeenCalled()
    expect(saveWorkingFileOrder).toHaveBeenCalledWith('abc', ['2', '1'])
    await waitFor(() => expect(screen.getAllByRole('status').some((status) => status.textContent === WORKING_FILES_SAVED)).toBe(true))
  })

  it('blocks boundary moves and repeat actions while saving', async () => {
    let resolveSave: () => void = () => {}
    vi.mocked(saveWorkingFileOrder).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        })
    )
    render(<EditorWorkingFiles />)
    openMoveMenu('File One')
    const moveUp = screen.getByRole('menuitem', { name: 'Move up File One' })
    expect(moveUp).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(moveUp)
    expect(saveWorkingFileOrder).not.toHaveBeenCalled()
    await dismissMoveMenu()
    openMoveMenu('File Two')
    const moveDown = screen.getByRole('menuitem', { name: 'Move down File Two' })
    expect(moveDown).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(moveDown)
    expect(saveWorkingFileOrder).not.toHaveBeenCalled()
    await dismissMoveMenu()
    openMoveMenu('File One')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Move down File One' }))
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    const handle = screen.getByRole('button', { name: 'Reorder File Two' })
    expect(handle).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(handle)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(saveWorkingFileOrder).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolveSave()
    })
  })

  it('restores the prior order and keeps focus when saving fails', async () => {
    vi.mocked(saveWorkingFileOrder).mockRejectedValueOnce(new Error('permission-denied'))
    render(<EditorWorkingFiles />)
    const handle = openMoveMenu('File Two')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Move up File Two' }))
    await screen.findByText(WORKING_FILES_SAVE_ERROR)
    await waitFor(() => expect(fileNames()).toEqual(['File One', 'File Two']))
    expect(document.activeElement).toBe(handle)
    expect(screen.getByRole('alert')).toHaveTextContent(WORKING_FILES_SAVE_ERROR)
  })

  it('leaves selection available while loading and after a preference error, with a working retry action', () => {
    vi.mocked(subscribeToWorkingFileOrder).mockReturnValue(unsubscribeOrder)
    render(<EditorWorkingFiles />)
    const handle = screen.getByRole('button', { name: 'Reorder File Two' })
    expect(handle).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(handle)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'File Two, locked' }))
    expect(mockSetWorkingFileID).toHaveBeenCalledWith('2')
    act(() => vi.mocked(subscribeToWorkingFileOrder).mock.calls[0][2](new Error('denied')))
    expect(screen.getByRole('alert')).toHaveTextContent(WORKING_FILES_LOAD_ERROR)
    fireEvent.click(screen.getByRole('button', { name: WORKING_FILES_RETRY_LABEL }))
    expect(unsubscribeOrder).toHaveBeenCalledOnce()
    act(() => vi.mocked(subscribeToWorkingFileOrder).mock.calls[1][1](['2', '1']))
    expect(fileNames()).toEqual(['File Two', 'File One'])
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('cleans up both subscriptions on unmount', () => {
    const { unmount } = render(<EditorWorkingFiles />)
    unmount()
    expect(unsubscribeFiles).toHaveBeenCalledOnce()
    expect(unsubscribeOrder).toHaveBeenCalledOnce()
  })

  it('opens the menu on a simple mouse click and returns focus on dismissal without saving', async () => {
    render(<EditorWorkingFiles />)
    const handle = screen.getByRole('button', { name: 'Reorder File Two' })
    fireEvent.mouseDown(handle, { button: 0, clientX: 20, clientY: 110 })
    fireEvent.mouseUp(handle, { button: 0, clientX: 20, clientY: 110 })
    fireEvent.click(handle)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await dismissMoveMenu()
    expect(document.activeElement).toBe(handle)
    expect(saveWorkingFileOrder).not.toHaveBeenCalled()
    expect(mockSetWorkingFileID).not.toHaveBeenCalled()
  })

  it('opens the menu after a touch tap and reorders without dragging', async () => {
    render(<EditorWorkingFiles />)
    const handle = screen.getByRole('button', { name: 'Reorder File One' })
    fireEvent.touchStart(handle, { touches: [{ identifier: 0, target: handle, clientX: 20, clientY: 20 }] })
    fireEvent.touchEnd(handle, { touches: [], changedTouches: [{ identifier: 0, clientX: 20, clientY: 20 }] })
    fireEvent.click(handle)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Move down File One' }))
    await waitFor(() => expect(saveWorkingFileOrder).toHaveBeenCalledWith('abc', ['2', '1']))
    await waitFor(() => expect(fileNames()).toEqual(['File Two', 'File One']))
    expect(mockSetWorkingFileID).not.toHaveBeenCalled()
  })

  it('allows Enter to activate the menu without starting a keyboard drag', async () => {
    render(<EditorWorkingFiles />)
    const handle = screen.getByRole('button', { name: 'Reorder File Two' })
    handle.focus()
    expect(fireEvent.keyDown(handle, { key: 'Enter', code: 'Enter' })).toBe(true)
    expect(handle).not.toHaveAttribute('aria-pressed', 'true')
    // jsdom does not synthesize the native button click generated by Enter.
    fireEvent.click(handle, { detail: 0 })
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await dismissMoveMenu()
    expect(document.activeElement).toBe(handle)
    expect(saveWorkingFileOrder).not.toHaveBeenCalled()
  })

  it('keeps the dropped order stable while saving without inserting a transient save label above the list', async () => {
    let resolveSave: () => void = () => {}
    vi.mocked(saveWorkingFileOrder).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        })
    )
    render(<EditorWorkingFiles />)
    const list = screen.getByRole('list', { name: 'Working files' })
    expect(list).toHaveAttribute('aria-busy', 'false')
    const handle = screen.getByRole('button', { name: 'Reorder File One' })
    fireEvent.mouseDown(handle, { button: 0, clientX: 20, clientY: 20 })
    fireEvent.mouseMove(document, { clientX: 20, clientY: 30 })
    await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'))
    fireEvent.mouseMove(document, { clientX: 20, clientY: 130 })
    fireEvent.mouseUp(document)
    fireEvent.click(handle)
    await waitFor(() => expect(saveWorkingFileOrder).toHaveBeenCalledWith('abc', ['2', '1']))
    expect(fileNames()).toEqual(['File Two', 'File One'])
    expect(list).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText(WORKING_FILES_SAVING, { exact: true })).not.toBeInTheDocument()
    expect(screen.getAllByRole('status').some((status) => status.textContent?.includes(WORKING_FILES_SAVING))).toBe(true)
    expect(mockSetWorkingFileID).not.toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await act(async () => {
      resolveSave()
    })
    expect(fileNames()).toEqual(['File Two', 'File One'])
    expect(list).toHaveAttribute('aria-busy', 'false')
    expect(screen.getAllByRole('status').some((status) => status.textContent === WORKING_FILES_SAVED)).toBe(true)
  })

  it('cancels a mouse drop outside the list without saving', async () => {
    render(<EditorWorkingFiles />)
    const handle = screen.getByRole('button', { name: 'Reorder File One' })
    fireEvent.mouseDown(handle, { button: 0, clientX: 20, clientY: 20 })
    fireEvent.mouseMove(document, { clientX: 20, clientY: 30 })
    await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'))
    fireEvent.mouseMove(document, { clientX: 400, clientY: 130 })
    fireEvent.mouseUp(document)
    expect(fileNames()).toEqual(['File One', 'File Two'])
    expect(saveWorkingFileOrder).not.toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('supports touch dragging after handle activation', async () => {
    render(<EditorWorkingFiles />)
    const handle = screen.getByRole('button', { name: 'Reorder File One' })
    fireEvent.touchStart(handle, { touches: [{ identifier: 0, target: handle, clientX: 20, clientY: 20 }] })
    await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'))
    fireEvent.touchMove(handle, { touches: [{ identifier: 0, target: handle, clientX: 20, clientY: 130 }] })
    fireEvent.touchEnd(handle, { touches: [], changedTouches: [{ identifier: 0, clientX: 20, clientY: 130 }] })
    fireEvent.click(handle)
    await waitFor(() => expect(saveWorkingFileOrder).toHaveBeenCalledWith('abc', ['2', '1']))
    expect(fileNames()).toEqual(['File Two', 'File One'])
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('supports cancelling a keyboard drag with Escape', async () => {
    render(<EditorWorkingFiles />)
    const handle = screen.getByRole('button', { name: 'Reorder File One' })
    handle.focus()
    fireEvent.keyDown(handle, { key: ' ', code: 'Space' })
    await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'))
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    await waitFor(() => expect(handle).not.toHaveAttribute('aria-pressed', 'true'))
    expect(saveWorkingFileOrder).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(handle)
  })

  it('reorders using the keyboard drag handle', async () => {
    render(<EditorWorkingFiles />)
    const handle = screen.getByRole('button', { name: 'Reorder File One' })
    handle.focus()
    fireEvent.keyDown(handle, { key: ' ', code: 'Space' })
    await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'))
    fireEvent.keyDown(document, { key: 'ArrowDown', code: 'ArrowDown' })
    fireEvent.keyDown(document, { key: ' ', code: 'Space' })
    await waitFor(() => expect(saveWorkingFileOrder).toHaveBeenCalledWith('abc', ['2', '1']))
    expect(fileNames()).toEqual(['File Two', 'File One'])
  })
})
