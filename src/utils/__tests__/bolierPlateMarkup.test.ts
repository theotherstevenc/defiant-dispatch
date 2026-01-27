import { describe, expect, it } from 'vitest'

import { boilerPlateMarkup } from '../boilerPlateMarkup'

describe('boilerplateMarkup', () => {
  it('should have html, text, amp properties', () => {
    expect(boilerPlateMarkup).toHaveProperty('html')
    expect(boilerPlateMarkup).toHaveProperty('text')
    expect(boilerPlateMarkup).toHaveProperty('amp')
  })
})
