import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import WorkingFilesScrollArea from '../WorkingFilesScrollArea'

let viewportHeight: number
let contentHeight: number
let notifyResize: () => void
const disconnect = vi.fn()

const renderScrollArea = () => {
  const result = render(
    <WorkingFilesScrollArea>
      <button>Open file</button>
    </WorkingFilesScrollArea>
  )
  return { ...result, viewport: screen.getByRole('region', { name: 'Working files' }) }
}

const preparePointerCapture = (scrollbar: HTMLElement) => {
  Object.defineProperties(scrollbar, {
    setPointerCapture: { value: vi.fn() },
    hasPointerCapture: { value: () => true },
    releasePointerCapture: { value: vi.fn() },
  })
}

describe('WorkingFilesScrollArea', () => {
  beforeEach(() => {
    viewportHeight = 200
    contentHeight = 1000
    disconnect.mockClear()
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => viewportHeight)
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => contentHeight)
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notifyResize = callback
        }
        observe = vi.fn()
        disconnect = disconnect
      }
    )
    vi.stubGlobal(
      'PointerEvent',
      class extends MouseEvent {
        pointerId: number
        constructor(type: string, init: PointerEventInit) {
          super(type, init)
          this.pointerId = init.pointerId ?? 1
        }
      }
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('only provides a scrollbar when content overflows', () => {
    contentHeight = viewportHeight
    renderScrollArea()
    expect(screen.queryByRole('scrollbar')).not.toBeInTheDocument()

    contentHeight = 1000
    act(() => notifyResize())
    const scrollbar = screen.getByRole('scrollbar', { name: 'Scroll working files' })
    expect(scrollbar).toHaveAttribute('aria-valuemax', '800')
    expect(screen.getByRole('button', { name: 'Open file' })).toBeInTheDocument()
  })

  it('tracks native scrolling and associates the scrollbar with its viewport', () => {
    const { viewport } = renderScrollArea()
    const scrollbar = screen.getByRole('scrollbar')
    expect(scrollbar).toHaveAttribute('aria-controls', viewport.id)

    fireEvent.scroll(viewport, { target: { scrollTop: 400 } })

    expect(scrollbar).toHaveAttribute('aria-valuenow', '400')
  })

  it('supports keyboard scrolling and clamps at each end', () => {
    const { viewport } = renderScrollArea()
    const scrollbar = screen.getByRole('scrollbar')
    fireEvent.keyDown(scrollbar, { key: 'PageDown' })
    expect(viewport.scrollTop).toBe(200)
    fireEvent.keyDown(scrollbar, { key: 'ArrowDown' })
    expect(viewport.scrollTop).toBe(240)
    fireEvent.keyDown(scrollbar, { key: 'End' })
    fireEvent.keyDown(scrollbar, { key: 'ArrowDown' })
    expect(viewport.scrollTop).toBe(800)
    fireEvent.keyDown(scrollbar, { key: 'Home' })
    fireEvent.keyDown(scrollbar, { key: 'ArrowUp' })
    expect(viewport.scrollTop).toBe(0)
  })

  it('drags the thumb proportionally and releases pointer capture', () => {
    const { viewport } = renderScrollArea()
    const scrollbar = screen.getByRole('scrollbar')
    preparePointerCapture(scrollbar)
    const thumb = scrollbar.firstElementChild
    if (!thumb) throw new Error('Missing scrollbar thumb')

    fireEvent.pointerDown(thumb, { button: 0, pointerId: 1, clientY: 10 })
    fireEvent.pointerMove(scrollbar, { pointerId: 2, clientY: 88 })
    expect(viewport.scrollTop).toBe(0)
    fireEvent.pointerMove(scrollbar, { pointerId: 1, clientY: 88 })
    expect(viewport.scrollTop).toBe(400)
    fireEvent.pointerUp(scrollbar, { pointerId: 1 })
    expect(scrollbar.releasePointerCapture).toHaveBeenCalledWith(1)
    fireEvent.pointerMove(scrollbar, { pointerId: 1, clientY: 166 })
    expect(viewport.scrollTop).toBe(400)
  })

  it('scrolls to a clicked track position and stops dragging on cancellation', () => {
    const { viewport } = renderScrollArea()
    const scrollbar = screen.getByRole('scrollbar')
    preparePointerCapture(scrollbar)

    fireEvent.pointerDown(scrollbar, { button: 0, pointerId: 1, clientY: 100 })
    expect(viewport.scrollTop).toBe(400)
    fireEvent.pointerCancel(scrollbar, { pointerId: 1 })
    fireEvent.pointerMove(scrollbar, { pointerId: 1, clientY: 150 })
    expect(viewport.scrollTop).toBe(400)
  })

  it('allows wheel scrolling over the overlaid scrollbar', () => {
    const { viewport } = renderScrollArea()
    fireEvent.wheel(screen.getByRole('scrollbar'), { deltaY: 150 })
    expect(viewport.scrollTop).toBe(150)
    fireEvent.wheel(screen.getByRole('scrollbar'), { deltaY: 50, ctrlKey: true })
    expect(viewport.scrollTop).toBe(150)
  })

  it('updates when the viewport resizes or files are removed and disconnects on unmount', () => {
    const { unmount } = renderScrollArea()
    viewportHeight = 400
    act(() => notifyResize())
    expect(screen.getByRole('scrollbar')).toHaveAttribute('aria-valuemax', '600')
    contentHeight = 200
    act(() => notifyResize())
    expect(screen.queryByRole('scrollbar')).not.toBeInTheDocument()
    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })
})
