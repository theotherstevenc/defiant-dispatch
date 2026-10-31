import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AppVersion from '../AppVersion'

describe('AppVersion', () => {
  afterEach(() => vi.restoreAllMocks())

  it('only reveals the hidden log after repeated deliberate activation', async () => {
    render(<AppVersion />)
    const version = screen.getByRole('button', { name: /Defiant Dispatch version/ })
    fireEvent.click(version)
    expect(screen.queryByText("Captain's log")).not.toBeInTheDocument()

    for (let index = 0; index < 4; index++) fireEvent.click(version)

    expect(screen.getByRole('status')).toHaveTextContent("Captain's log")
    expect(screen.getByRole('status')).toHaveTextContent('Dispatch ready. Shields up.')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  })

  it('does not accumulate activations separated by a long pause', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000)
    render(<AppVersion />)
    const version = screen.getByRole('button', { name: /Defiant Dispatch version/ })
    for (let index = 0; index < 4; index++) fireEvent.click(version)
    now.mockReturnValue(5000)

    fireEvent.click(version)

    expect(screen.queryByText("Captain's log")).not.toBeInTheDocument()
    for (let index = 0; index < 4; index++) fireEvent.click(version)
    expect(screen.getByRole('status')).toHaveTextContent('Dispatch ready. Shields up.')
  })
})
