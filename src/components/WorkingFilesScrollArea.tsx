import { Box } from '@mui/material'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { workingFilesScrollAreaStyles, workingFilesViewportStyles } from '../styles/global.styles'
import { WORKING_FILES_LABEL, WORKING_FILES_SCROLLBAR_LABEL } from '../utils/constants'

import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'

interface WorkingFilesScrollAreaProps {
  children: ReactNode
}

interface ScrollMetrics {
  height: number
  scrollHeight: number
  scrollTop: number
}

interface ScrollDrag {
  pointerId: number
  startY: number
  startScrollTop: number
}

const MIN_THUMB_HEIGHT = 44
const KEYBOARD_SCROLL_STEP = 40

const WorkingFilesScrollArea = ({ children }: WorkingFilesScrollAreaProps) => {
  const viewportId = useId()
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const scrollbarRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<ScrollDrag | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [metrics, setMetrics] = useState<ScrollMetrics>({ height: 0, scrollHeight: 0, scrollTop: 0 })

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const next = { height: viewport.clientHeight, scrollHeight: viewport.scrollHeight, scrollTop: viewport.scrollTop }
    setMetrics((current) =>
      current.height === next.height && current.scrollHeight === next.scrollHeight && current.scrollTop === next.scrollTop ? current : next
    )
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    const observer = new ResizeObserver(updateMetrics)
    observer.observe(viewport)
    observer.observe(content)
    updateMetrics()
    return () => observer.disconnect()
  }, [updateMetrics])

  const maxScroll = Math.max(0, metrics.scrollHeight - metrics.height)
  const hasOverflow = metrics.height > 0 && maxScroll > 0
  const minimumThumbHeight = Math.min(MIN_THUMB_HEIGHT, metrics.height / 2)
  const thumbHeight = hasOverflow ? Math.max(minimumThumbHeight, metrics.height ** 2 / metrics.scrollHeight) : 0
  const thumbTravel = metrics.height - thumbHeight
  const thumbTop = maxScroll > 0 ? (Math.max(0, Math.min(maxScroll, metrics.scrollTop)) / maxScroll) * thumbTravel : 0

  useEffect(() => {
    const scrollbar = scrollbarRef.current
    const viewport = viewportRef.current
    if (!scrollbar || !viewport) return
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY === 0) return
      event.preventDefault()
      const unit = event.deltaMode === 1 ? KEYBOARD_SCROLL_STEP : event.deltaMode === 2 ? viewport.clientHeight : 1
      viewport.scrollTop += event.deltaY * unit
      updateMetrics()
    }
    scrollbar.addEventListener('wheel', handleWheel, { passive: false })
    return () => scrollbar.removeEventListener('wheel', handleWheel)
  }, [hasOverflow, updateMetrics])

  const scrollTo = (scrollTop: number) => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.scrollTop = Math.max(0, Math.min(maxScroll, scrollTop))
    updateMetrics()
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || dragRef.current || thumbTravel <= 0) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    if (event.target instanceof Node && !thumbRef.current?.contains(event.target)) {
      const position = event.clientY - event.currentTarget.getBoundingClientRect().top - thumbHeight / 2
      scrollTo((position / thumbTravel) * maxScroll)
    }
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY, startScrollTop: viewportRef.current?.scrollTop ?? 0 }
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId || thumbTravel <= 0) return
    scrollTo(drag.startScrollTop + ((event.clientY - drag.startY) / thumbTravel) * maxScroll)
  }

  const handleDragEnd = () => {
    dragRef.current = null
    setIsDragging(false)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== dragRef.current?.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    handleDragEnd()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    let destination: number
    switch (event.key) {
      case 'ArrowDown':
        destination = metrics.scrollTop + KEYBOARD_SCROLL_STEP
        break
      case 'ArrowUp':
        destination = metrics.scrollTop - KEYBOARD_SCROLL_STEP
        break
      case 'PageDown':
        destination = metrics.scrollTop + metrics.height
        break
      case 'PageUp':
        destination = metrics.scrollTop - metrics.height
        break
      case ' ':
        destination = metrics.scrollTop + (event.shiftKey ? -metrics.height : metrics.height)
        break
      case 'Home':
        destination = 0
        break
      case 'End':
        destination = maxScroll
        break
      default:
        return
    }
    event.preventDefault()
    scrollTo(destination)
  }

  return (
    <Box sx={workingFilesScrollAreaStyles} data-dragging={isDragging}>
      <Box
        ref={viewportRef}
        id={viewportId}
        role='region'
        aria-label={WORKING_FILES_LABEL}
        tabIndex={0}
        onScroll={updateMetrics}
        sx={workingFilesViewportStyles}>
        <Box ref={contentRef}>{children}</Box>
      </Box>
      {hasOverflow && (
        <Box
          ref={scrollbarRef}
          className='working-files-scrollbar'
          role='scrollbar'
          aria-label={WORKING_FILES_SCROLLBAR_LABEL}
          aria-controls={viewportId}
          aria-orientation='vertical'
          aria-valuemin={0}
          aria-valuemax={maxScroll}
          aria-valuenow={Math.max(0, Math.min(maxScroll, metrics.scrollTop))}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handleDragEnd}
          onLostPointerCapture={handleDragEnd}>
          <Box
            ref={thumbRef}
            className='working-files-scrollbar-thumb'
            aria-hidden='true'
            sx={{ height: thumbHeight, transform: `translateY(${thumbTop}px)` }}
          />
        </Box>
      )}
    </Box>
  )
}

export default WorkingFilesScrollArea
