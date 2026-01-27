// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest'

import forceIframeReflow from '../forceIframeReflow'

describe('forceIframeReflow', () => {
  it('should force a reflow on the iframe', () => {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const setDisplay = vi.spyOn(iframe.style, 'display', 'set')

    forceIframeReflow(iframe)

    expect(setDisplay).toHaveBeenCalledWith('none')
    expect(setDisplay).toHaveBeenCalledWith('block')
    expect(iframe.style.display).toBe('block')
  })

  it('should do nothing if iframe is null', () => {
    expect(() => forceIframeReflow(null)).not.toThrow()
  })
})
