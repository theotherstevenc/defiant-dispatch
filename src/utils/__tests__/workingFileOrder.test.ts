import { describe, expect, it } from 'vitest'

import { moveWorkingFile, orderWorkingFiles } from '../workingFileOrder'

import type { WorkingFile } from '../../interfaces'

const files: WorkingFile[] = ['a', 'b', 'c'].map((id) => ({
  id,
  fileName: id,
  html: `<p>${id}</p>`,
  text: id,
  amp: '',
  isFileLocked: id === 'b',
}))

describe('orderWorkingFiles', () => {
  it('keeps saved IDs in order, ignores deleted/duplicate IDs, and appends new files', () => {
    expect(orderWorkingFiles(files, ['b', 'deleted', 'b', 'a'])).toEqual([files[1], files[0], files[2]])
    expect(files.map((file) => file.id)).toEqual(['a', 'b', 'c'])
  })

  it('preserves the current order without preferences and handles empty files', () => {
    expect(orderWorkingFiles(files, [])).toEqual(files)
    expect(orderWorkingFiles([], ['deleted'])).toEqual([])
  })
})

describe('moveWorkingFile', () => {
  it('moves a locked file without changing content or the original array', () => {
    expect(moveWorkingFile(files, 'b', 0)).toEqual([files[1], files[0], files[2]])
    expect(files.map((file) => file.id)).toEqual(['a', 'b', 'c'])
  })

  it.each([-1, 3, 0.5, NaN])('ignores invalid destination %s', (destination) => {
    expect(moveWorkingFile(files, 'a', destination)).toBe(files)
  })

  it('ignores absent IDs and moves that leave the position unchanged', () => {
    expect(moveWorkingFile(files, 'absent', 0)).toBe(files)
    expect(moveWorkingFile(files, 'a', 0)).toBe(files)
    expect(moveWorkingFile([], 'a', 0)).toEqual([])
    expect(moveWorkingFile([files[0]], 'a', 0)).toEqual([files[0]])
  })
})
