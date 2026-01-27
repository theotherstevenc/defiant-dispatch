import { describe, it, expect } from 'vitest'

import { customMinifier } from '../customMinifier'

describe('customMinifier', () => {
  it('should remove newlines and leading whitespace within conditional comments', () => {
    const input = '<!--[if mso]>\n  <p>Test</p>\n<![endif]-->'
    const expected = '<!--[if mso]><p>Test</p><![endif]-->'
    expect(customMinifier(input)).toBe(expected)
  })

  it('should remove newlines and leading whitespace globally', () => {
    const input = '<div>\n  <p>Test</p>\n</div>'
    const expected = '<div><p>Test</p></div>'
    expect(customMinifier(input)).toBe(expected)
  })

  it('should remove whitespace between tags', () => {
    const input = '<div> \n <p>Test</p> </div>'
    const expected = '<div><p>Test</p></div>'
    expect(customMinifier(input)).toBe(expected)
  })

  it('should remove comments except conditional comments', () => {
    const input = '<!-- This is a comment -->\n<div><p>Test</p></div><!--[if mso]><p>MSO Comment</p><![endif]-->'
    const expected = '<div><p>Test</p></div><!--[if mso]><p>MSO Comment</p><![endif]-->'
    expect(customMinifier(input)).toBe(expected)
  })
})
