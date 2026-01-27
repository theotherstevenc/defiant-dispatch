import { describe, it, expect } from 'vitest'

import { EDITOR_OPTION_TEXT } from '../constants'
import getSanitizedValue from '../getSanitizedValue'

describe('getSanitizedValue', () => {
  it('should sanitize and wrap the value provided in EDITOR_OPTION_TEXT', () => {
    const input = {
      type: EDITOR_OPTION_TEXT,
      value: '< > " \' &',
    }
    const result = getSanitizedValue(input)
    expect(result).toContain('<pre class="editorOptionText">&lt; &gt; &quot; &#39; &amp;</pre>')
    expect(result).toContain('<pre class="editorOptionText">')
  })

  it('should include the exact rootColorScheme markup before <pre>', () => {
    const input = {
      type: EDITOR_OPTION_TEXT,
      value: 'test',
    }
    const result = getSanitizedValue(input)
    expect(result).toContain('<style>')
    expect(result).toContain(':root {')
    expect(result).toContain('color-scheme: light dark;')
    expect(result).toContain('.editorOptionText {')
    expect(result).toContain('white-space: pre-wrap;')
  })

  it('returns value as-is for non-text editor', () => {
    const input = {
      type: 'NOT_EDITOR_OPTION_TEXT',
      value: '<b>bold</b>',
    }
    expect(getSanitizedValue(input)).toBe('<b>bold</b>')
  })
})
