import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import EditorSendButton from '../EditorSendButton'

vi.mock('../../context/EditorConfigContext', () => ({
  useEditorConfigContext: () => ({
    isPreventThreadingEnabled: false,
  }),
}))

vi.mock('../../context/EditorContext', () => ({
  useEditorContext: () => ({
    html: '<p>Hello</p>',
    text: 'Hello',
    amp: '',
  }),
}))

vi.mock('../../context/EmailSettingsContext', () => ({
  useEmailSettingsContext: () => ({
    subject: 'Test Subject',
    setSubject: vi.fn(),
    emailAddresses: ['test@example.com'],
    setEmailAddresses: vi.fn(),
    inputSenderSettings: { host: 'smtp.test.com', port: '587', username: 'user', pass: 'pass', from: 'from@test.com' },
    setInputSenderSettings: vi.fn(),
  }),
}))

describe('EditorSendButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Send button', () => {
    render(<EditorSendButton />)
    expect(screen.getByText('Send Email')).toBeInTheDocument()
  })

  it('calls fetch on click', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    render(<EditorSendButton />)
    fireEvent.click(screen.getByText('Send Email'))
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })
  })

  it('sends correct email data in request body', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    render(<EditorSendButton />)
    fireEvent.click(screen.getByText('Send Email'))
    await vi.waitFor(() => {
      const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
      expect(body.testaddress).toEqual(['test@example.com'])
      expect(body.testsubject).toBe('Test Subject')
      expect(body.htmlversion).toBe('<p>Hello</p>')
      expect(body.textversion).toBe('Hello')
      expect(body.host).toBe('smtp.test.com')
    })
  })
})
