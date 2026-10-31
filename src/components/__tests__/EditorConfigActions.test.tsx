import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEditorConfigContext } from '../../context/EditorConfigContext'
import { useEditorContext } from '../../context/EditorContext'
import { useEmailSettingsContext } from '../../context/EmailSettingsContext'
import { encryptString } from '../../utils/encryptString'
import { updateFirestoreDoc } from '../../utils/updateFirestoreDoc'
import EditorConfigActions from '../EditorConfigActions'

vi.mock('../../firebase', () => ({ db: {} }))
vi.mock('firebase/auth', () => ({ getAuth: vi.fn(() => ({})) }))
vi.mock('../../context/AuthContext', () => ({ useAuthContext: () => ({ user: null }) }))
vi.mock('../../context/EditorConfigContext', () => ({ useEditorConfigContext: vi.fn() }))
vi.mock('../../context/EditorContext', () => ({ useEditorContext: vi.fn() }))
vi.mock('../../context/EmailSettingsContext', () => ({ useEmailSettingsContext: vi.fn() }))
vi.mock('../../context/ThemeSettingsContext', () => ({
  useThemeSettingsContext: () => ({
    appColorScheme: 'system',
    isDarkMode: false,
    isPreviewDarkMode: false,
    setAppColorScheme: vi.fn(),
    setIsDarkMode: vi.fn(),
    setIsPreviewDarkMode: vi.fn(),
  }),
}))
vi.mock('../../utils/updateFirestoreDoc', () => ({ updateFirestoreDoc: vi.fn().mockResolvedValue(undefined) }))
vi.mock('../../utils/encryptString', () => ({ encryptString: vi.fn().mockResolvedValue('encrypted-password') }))

const editorState = {
  html: '<p>Draft content</p>',
  setHtml: vi.fn(),
  originalHtml: '<p>Original content</p>',
  setOriginalHtml: vi.fn(),
  text: '',
  setText: vi.fn(),
  amp: '',
  setAmp: vi.fn(),
  workingFileID: 'project-1',
  setWorkingFileID: vi.fn(),
  deletedWorkingFileID: '',
  setDeletedWorkingFileID: vi.fn(),
  workingFileName: 'Test project',
  setWorkingFileName: vi.fn(),
  files: [],
  setFiles: vi.fn(),
  isFileLocked: false,
  setIsFileLocked: vi.fn(),
  editorFontSize: 12,
  setEditorFontSize: vi.fn(),
}

const configState = {
  isMinifyEnabled: false,
  setIsMinifyEnabled: vi.fn(),
  isWordWrapEnabled: false,
  setIsWordWrapEnabled: vi.fn(),
  isPreventThreadingEnabled: false,
  setIsPreventThreadingEnabled: vi.fn(),
  activeEditor: 'html',
  setActiveEditor: vi.fn(),
  hideWorkingFiles: false,
  setHideWorkingFiles: vi.fn(),
}

describe('EditorConfigActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useEditorContext).mockReturnValue(editorState)
    vi.mocked(useEditorConfigContext).mockReturnValue(configState)
    vi.mocked(useEmailSettingsContext).mockReturnValue({
      subject: '',
      setSubject: vi.fn(),
      emailAddresses: [],
      setEmailAddresses: vi.fn(),
      inputSenderSettings: { host: 'smtp.example.com', port: '587', username: 'test', pass: '', from: 'test@example.com' },
      setInputSenderSettings: vi.fn(),
    })
  })

  it('keeps settings in the drawer and restores focus to the bottom bar after closing', async () => {
    render(<EditorConfigActions />)
    expect(screen.queryByRole('textbox', { name: 'host' })).not.toBeInTheDocument()
    const settingsButton = screen.getByRole('button', { name: 'Settings' })
    settingsButton.focus()
    fireEvent.click(settingsButton)

    const drawer = screen.getByRole('dialog', { name: 'Settings' })
    expect(within(drawer).queryByText(/Defiant Dispatch - version/)).not.toBeInTheDocument()
    expect(within(drawer).getByRole('heading', { name: 'Content options' })).toBeInTheDocument()
    expect(within(drawer).getByRole('heading', { name: 'Sending' })).toBeInTheDocument()
    expect(within(drawer).getByRole('heading', { name: 'Appearance' })).toBeInTheDocument()
    expect(within(drawer).getByRole('textbox', { name: 'host' })).toHaveValue('smtp.example.com')
    fireEvent.click(within(drawer).getByRole('button', { name: 'Close' }))

    await waitFor(() => expect(drawer).not.toBeVisible())
    expect(settingsButton).toHaveFocus()
  })

  it('groups all three checkboxes together while retaining accessible section and theme names', () => {
    render(<EditorConfigActions />)
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

    const options = screen.getByRole('region', { name: 'Content options' })
    expect(within(options).getAllByRole('checkbox')).toHaveLength(3)
    expect(within(options).getByRole('checkbox', { name: 'Minify' })).toBeInTheDocument()
    expect(within(options).getByRole('checkbox', { name: 'Word Wrap' })).toBeInTheDocument()
    expect(within(options).getByRole('checkbox', { name: 'Prevent Threading' })).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Sending' })).getByRole('textbox', { name: 'host' })).toBeVisible()
    const appearance = screen.getByRole('region', { name: 'Appearance' })
    expect(within(appearance).getByRole('radiogroup', { name: 'App interface' })).toBeVisible()
    expect(within(appearance).getByRole('radiogroup', { name: 'Code editor' })).toBeVisible()
    expect(within(appearance).getByRole('radiogroup', { name: 'Email preview' })).toBeVisible()
  })

  it('does not reapply minification when opening or reopening settings', async () => {
    vi.mocked(useEditorConfigContext).mockReturnValue({ ...configState, isMinifyEnabled: true })
    render(<EditorConfigActions />)
    expect(editorState.setHtml).toHaveBeenCalledTimes(1)
    expect(editorState.setOriginalHtml).toHaveBeenCalledTimes(1)
    const settingsButton = screen.getByRole('button', { name: 'Settings' })

    fireEvent.click(settingsButton)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    fireEvent.click(settingsButton)

    expect(editorState.setHtml).toHaveBeenCalledTimes(1)
    expect(editorState.setOriginalHtml).toHaveBeenCalledTimes(1)
  })

  it('preserves blur-based sender saves and password encryption inside settings', async () => {
    render(<EditorConfigActions />)
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.blur(screen.getByLabelText('host'), { target: { id: 'host', value: 'smtp.updated.com' } })
    fireEvent.blur(screen.getByLabelText('pass'), { target: { id: 'pass', value: 'new-password' } })

    await waitFor(() => {
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', expect.objectContaining({ host: 'smtp.updated.com' }))
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', expect.objectContaining({ pass: 'encrypted-password' }))
    })
    expect(encryptString).toHaveBeenCalledWith('new-password')
  })

  it('saves the focused password field when closing settings with Escape', async () => {
    vi.mocked(useEmailSettingsContext).mockImplementation(function useSettingsMock() {
      const [inputSenderSettings, setInputSenderSettings] = useState({
        host: '',
        port: '',
        username: '',
        pass: '',
        from: '',
      })
      return {
        subject: '',
        setSubject: vi.fn(),
        emailAddresses: [],
        setEmailAddresses: vi.fn(),
        inputSenderSettings,
        setInputSenderSettings,
      }
    })
    render(<EditorConfigActions />)
    const settingsButton = screen.getByRole('button', { name: 'Settings' })
    settingsButton.focus()
    fireEvent.click(settingsButton)
    const password = screen.getByLabelText('pass')
    password.focus()
    fireEvent.change(password, { target: { value: 'new-password' } })
    fireEvent.keyDown(password, { key: 'Escape' })

    await waitFor(() => {
      expect(encryptString).toHaveBeenCalledWith('new-password')
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', expect.objectContaining({ pass: 'encrypted-password' }))
    })
    expect(settingsButton).toHaveFocus()
  })

  it.each([
    ['Create New Project', 'Create New Project'],
    ['Rename Project', 'Rename Project'],
    ['Delete Project', 'Confirm Delete'],
  ])('keeps the %s dialog open after dismissing the File menu', async (action, title) => {
    render(<EditorConfigActions />)
    const fileButton = screen.getByRole('button', { name: 'File' })
    fileButton.focus()
    fireEvent.click(fileButton)
    const menu = screen.getByRole('menu', { name: 'File' })
    expect(within(menu).getByRole('menuitem', { name: 'Create New Project' })).toHaveFocus()
    fireEvent.click(within(menu).getByRole('menuitem', { name: action }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(title)).toBeVisible()
    await waitFor(() => expect(menu).not.toBeVisible())
    expect(dialog).toBeVisible()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(fileButton).toHaveFocus()
  })

  it('supports arrow-key navigation past the upload action and restores focus on Escape', async () => {
    render(<EditorConfigActions />)
    const fileButton = screen.getByRole('button', { name: 'File' })
    fileButton.focus()
    fireEvent.click(fileButton)
    const menu = screen.getByRole('menu', { name: 'File' })
    fireEvent.keyDown(document.activeElement ?? menu, { key: 'ArrowDown' })
    expect(within(menu).getByRole('menuitem', { name: 'Rename Project' })).toHaveFocus()
    fireEvent.keyDown(document.activeElement ?? menu, { key: 'ArrowDown' })
    expect(within(menu).getByRole('menuitem', { name: 'Upload + Convert EML' })).toHaveFocus()
    fireEvent.keyDown(document.activeElement ?? menu, { key: 'ArrowDown' })
    expect(within(menu).getByRole('menuitem', { name: 'Delete Project' })).toHaveFocus()
    fireEvent.keyDown(menu, { key: 'Escape' })
    await waitFor(() => expect(menu).not.toBeVisible())
    expect(fileButton).toHaveFocus()
  })
})
