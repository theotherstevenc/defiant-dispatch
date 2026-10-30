/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { signOut } from 'firebase/auth'
import { beforeEach, describe, it, expect, vi } from 'vitest'

import { Authenticator } from '../../components'
import * as AuthContext from '../../context/AuthContext'
import * as EditorContext from '../../context/EditorContext'
import { EditorContextProps } from '../../interfaces'

const mockSetHtml = vi.fn()
const mockSetText = vi.fn()
const mockSetAmp = vi.fn()
const mockSetWorkingFileID = vi.fn()
const mockSetWorkingFileName = vi.fn()
const mockSetFiles = vi.fn()

vi.mock('firebase/auth', async (importOriginal) => {
  const original = await importOriginal<typeof import('firebase/auth')>()
  return { ...original, signOut: vi.fn().mockResolvedValue(undefined) }
})

const mockEditorContext: EditorContextProps = {
  html: '',
  setHtml: mockSetHtml,
  originalHtml: '',
  setOriginalHtml: vi.fn(),
  text: '',
  setText: mockSetText,
  amp: '',
  setAmp: mockSetAmp,
  workingFileID: '',
  setWorkingFileID: mockSetWorkingFileID,
  deletedWorkingFileID: '',
  setDeletedWorkingFileID: vi.fn(),
  workingFileName: '',
  setWorkingFileName: mockSetWorkingFileName,
  files: [],
  setFiles: mockSetFiles,
  isFileLocked: false,
  setIsFileLocked: vi.fn(),
  editorFontSize: 0,
  setEditorFontSize: vi.fn(),
}

describe('Authenticator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when user is NOT authenticated', () => {
    beforeEach(() => {
      vi.spyOn(AuthContext, 'useAuthContext').mockReturnValue({ user: null })
      vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(mockEditorContext)
    })

    it('renders without crashing', () => {
      render(<Authenticator />)
      expect(true).toBe(true)
    })

    it('shows the Login button', () => {
      render(<Authenticator />)
      const loginButtons = screen.getAllByRole('button', { name: 'Login' })
      expect(loginButtons.length).toBeGreaterThan(0)
    })

    it('shows LoginIcon (not LogoutIcon)', () => {
      render(<Authenticator />)
      expect(screen.queryByTestId('LoginIcon')).toBeInTheDocument()
      expect(screen.queryByTestId('LogoutIcon')).not.toBeInTheDocument()
    })

    it('opens login dialog on click', () => {
      render(<Authenticator />)
      fireEvent.click(screen.getAllByRole('button', { name: 'Login' })[0])
      expect(screen.getByLabelText('username')).toBeInTheDocument()
      expect(screen.getByLabelText('password')).toBeInTheDocument()
    })
  })

  describe('when user IS authenticated', () => {
    beforeEach(() => {
      vi.spyOn(AuthContext, 'useAuthContext').mockReturnValue({
        user: { uid: 'test-uid' } as any,
      })
      vi.spyOn(EditorContext, 'useEditorContext').mockReturnValue(mockEditorContext)
    })

    it('opens the Account menu without logging out', () => {
      render(<Authenticator />)
      fireEvent.click(screen.getByRole('button', { name: 'Account' }))
      expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeVisible()
      expect(signOut).not.toHaveBeenCalled()
      expect(mockSetHtml).not.toHaveBeenCalled()
    })

    it('logs out and clears editor state only after selecting Logout', async () => {
      render(<Authenticator />)
      fireEvent.click(screen.getByRole('button', { name: 'Account' }))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Logout' }))

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1)
        expect(mockSetHtml).toHaveBeenCalledWith('')
        expect(mockSetText).toHaveBeenCalledWith('')
        expect(mockSetAmp).toHaveBeenCalledWith('')
        expect(mockSetWorkingFileID).toHaveBeenCalledWith('')
        expect(mockSetWorkingFileName).toHaveBeenCalledWith('')
        expect(mockSetFiles).toHaveBeenCalledWith([])
      })
    })

    it('dismisses the Account menu with Escape without logging out', async () => {
      render(<Authenticator />)
      const accountButton = screen.getByRole('button', { name: 'Account' })
      accountButton.focus()
      fireEvent.click(accountButton)
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
      expect(signOut).not.toHaveBeenCalled()
      expect(accountButton).toHaveFocus()
    })
  })
})
