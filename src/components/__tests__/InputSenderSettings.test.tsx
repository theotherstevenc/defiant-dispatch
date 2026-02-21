import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import InputSenderSettings from '../InputSenderSettings'

const mockSetInputSenderSettings = vi.fn()

vi.mock('../../context/EmailSettingsContext', () => ({
  useEmailSettingsContext: () => ({
    subject: '',
    setSubject: vi.fn(),
    emailAddresses: [],
    setEmailAddresses: vi.fn(),
    inputSenderSettings: { host: 'smtp.test.com', port: '587', username: 'user', pass: 'pass', from: 'from@test.com' },
    setInputSenderSettings: mockSetInputSenderSettings,
  }),
}))

vi.mock('../../utils/updateFirestoreDoc', () => ({
  updateFirestoreDoc: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../utils/encryptString', () => ({
  encryptString: vi.fn().mockResolvedValue('encrypted'),
}))

vi.mock('../../firebase', () => ({ db: {} }))

describe('InputSenderSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all five sender setting fields', () => {
    render(<InputSenderSettings />)
    expect(screen.getByLabelText('host')).toBeInTheDocument()
    expect(screen.getByLabelText('port')).toBeInTheDocument()
    expect(screen.getByLabelText('username')).toBeInTheDocument()
    expect(screen.getByLabelText('pass')).toBeInTheDocument()
    expect(screen.getByLabelText('from')).toBeInTheDocument()
  })

  it('displays current sender settings values', () => {
    render(<InputSenderSettings />)
    expect(screen.getByLabelText('host')).toHaveValue('smtp.test.com')
    expect(screen.getByLabelText('port')).toHaveValue('587')
    expect(screen.getByLabelText('username')).toHaveValue('user')
    expect(screen.getByLabelText('from')).toHaveValue('from@test.com')
  })

  it('calls setInputSenderSettings on keystroke', () => {
    render(<InputSenderSettings />)
    fireEvent.change(screen.getByLabelText('host'), { target: { id: 'host', value: 'new.smtp.com' } })
    expect(mockSetInputSenderSettings).toHaveBeenCalled()
  })

  it('calls updateFirestoreDoc on blur', async () => {
    const { updateFirestoreDoc } = await import('../../utils/updateFirestoreDoc')
    render(<InputSenderSettings />)
    fireEvent.blur(screen.getByLabelText('host'), { target: { id: 'host', value: 'smtp.test.com' } })
    await vi.waitFor(() => {
      expect(updateFirestoreDoc).toHaveBeenCalled()
    })
  })
})
