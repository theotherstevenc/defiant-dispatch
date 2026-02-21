import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import InputEmailListSubjectLine from '../InputEmailListSubjectLine'

const mockSetSubject = vi.fn()
const mockSetEmailAddresses = vi.fn()

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    isPreventThreadingEnabled: false,
  }),
}))

vi.mock('../../context/EmailSettingsContext', () => ({
  useEmailSettingsContext: () => ({
    subject: 'Test Subject',
    setSubject: mockSetSubject,
    emailAddresses: ['test@example.com'],
    setEmailAddresses: mockSetEmailAddresses,
    inputSenderSettings: { host: '', port: '', username: '', pass: '', from: '' },
    setInputSenderSettings: vi.fn(),
  }),
}))

vi.mock('../../utils/updateFirestoreDoc', () => ({
  updateFirestoreDoc: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../firebase', () => ({ db: {} }))

describe('InputEmailListSubjectLine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders subject text field with current value', () => {
    render(<InputEmailListSubjectLine />)
    const subjectInput = screen.getByLabelText('Subject Line')
    expect(subjectInput).toHaveValue('Test Subject')
  })

  it('calls setSubject on keystroke', () => {
    render(<InputEmailListSubjectLine />)
    const subjectInput = screen.getByLabelText('Subject Line')
    fireEvent.change(subjectInput, { target: { value: 'New Subject' } })
    expect(mockSetSubject).toHaveBeenCalledWith('New Subject')
  })

  it('calls updateFirestoreDoc on blur', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    render(<InputEmailListSubjectLine />)
    const subjectInput = screen.getByLabelText('Subject Line')
    fireEvent.blur(subjectInput)
    await vi.waitFor(() => {
      expect(updateFirestoreDoc).toHaveBeenCalledWith({}, 'config', 'editorSettings', { subject: 'Test Subject' })
    })
  })

  it('renders email chip with existing address', () => {
    render(<InputEmailListSubjectLine />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})
