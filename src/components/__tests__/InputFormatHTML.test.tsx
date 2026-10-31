import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { INPUT_FORMAT_HTML_ERROR } from '../../utils/constants'
import { logError } from '../../utils/logError'
import InputFormatHTML from '../InputFormatHTML'

const { formatHtml, loadFormatter, setHtml } = vi.hoisted(() => ({
  formatHtml: vi.fn(),
  loadFormatter: vi.fn(),
  setHtml: vi.fn(),
}))
let editor = { html: '<div><p>Hello</p></div>', workingFileID: 'file-1', setHtml }
let isMinifyEnabled = false

vi.mock('../../context/EditorContext', () => ({ useEditorContext: () => editor }))
vi.mock('../../context/EditorConfigContext', () => ({ useEditorConfigContext: () => ({ isMinifyEnabled }) }))
vi.mock('../../utils/logError', () => ({ logError: vi.fn() }))
vi.mock('js-beautify', () => {
  loadFormatter()
  return { default: { html: formatHtml } }
})

describe('InputFormatHTML', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    formatHtml.mockReturnValue('Formatted HTML')
    editor = { html: '<div><p>Hello</p></div>', workingFileID: 'file-1', setHtml }
    isMinifyEnabled = false
  })

  it('loads the formatter only when requested and formats HTML with the existing options', async () => {
    render(<InputFormatHTML />)
    expect(loadFormatter).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Format HTML' }))

    await waitFor(() => expect(setHtml).toHaveBeenCalledWith('Formatted HTML'))
    expect(formatHtml).toHaveBeenCalledWith('<div><p>Hello</p></div>', {
      indent_size: 1,
      max_preserve_newlines: 1,
      preserve_newlines: true,
      wrap_line_length: 120,
    })
    expect(loadFormatter).toHaveBeenCalledOnce()
  })

  it('does not load or format when minification is enabled', () => {
    isMinifyEnabled = true
    render(<InputFormatHTML />)

    fireEvent.click(screen.getByRole('button', { name: 'Format HTML' }))

    expect(loadFormatter).not.toHaveBeenCalled()
    expect(setHtml).not.toHaveBeenCalled()
    expect(logError).toHaveBeenCalledWith('Formatting is disabled when minification is enabled', 'InputFormatHTML')
  })

  it.each(['editing HTML', 'switching files', 'enabling minification'])('does not apply an old request after %s while loading', async (change) => {
    const { rerender } = render(<InputFormatHTML />)
    fireEvent.click(screen.getByRole('button', { name: 'Format HTML' }))

    if (change === 'editing HTML') editor = { ...editor, html: '<p>New draft</p>' }
    if (change === 'switching files') editor = { ...editor, workingFileID: 'file-2' }
    if (change === 'enabling minification') isMinifyEnabled = true
    rerender(<InputFormatHTML />)
    await act(async () => {
      await vi.dynamicImportSettled()
    })

    expect(setHtml).not.toHaveBeenCalled()
    expect(formatHtml).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not update the document after unmounting while the formatter loads', async () => {
    const { unmount } = render(<InputFormatHTML />)
    fireEvent.click(screen.getByRole('button', { name: 'Format HTML' }))

    unmount()
    await act(async () => {
      await vi.dynamicImportSettled()
    })

    expect(setHtml).not.toHaveBeenCalled()
  })

  it('logs a failed chunk load and shows an actionable error without changing the document', async () => {
    vi.doMock('js-beautify', () => {
      throw new Error('Chunk download failed')
    })
    render(<InputFormatHTML />)

    fireEvent.click(screen.getByRole('button', { name: 'Format HTML' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(INPUT_FORMAT_HTML_ERROR)
    expect(setHtml).not.toHaveBeenCalled()
    expect(logError).toHaveBeenCalledWith('Failed to format HTML:', 'InputFormatHTML', expect.any(Error))
  })
})
