import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AppVersion from '../AppVersion'

describe('AppVersion', () => {
  it('displays the version as non-interactive text without revealing an Easter egg', () => {
    render(<AppVersion />)
    const version = screen.getByText(`Defiant Dispatch - version ${__APP_VERSION__}`)
    for (let index = 0; index < 5; index++) fireEvent.click(version)

    expect(version).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
