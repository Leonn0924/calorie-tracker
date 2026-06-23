import { describe, it, expect } from 'vitest'
import { getToday, formatDate, parseDate, addDays } from '../date'

describe('Date Utils', () => {
  describe('getToday', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      const today = getToday()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return current date', () => {
      const today = getToday()
      const now = new Date()
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      expect(today).toBe(expected)
    })
  })

  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date(2026, 5, 23) // June 23, 2026
      const formatted = formatDate(date)
      expect(formatted).toBe('2026-06-23')
    })

    it('should format date string to YYYY-MM-DD', () => {
      const dateStr = '2026-06-23T10:30:00.000Z'
      const formatted = formatDate(dateStr)
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD string to Date', () => {
      const date = parseDate('2026-06-23')
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(5) // June is 5 (0-indexed)
      expect(date.getDate()).toBe(23)
    })
  })

  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date(2026, 5, 23)
      const result = addDays(date, 7)
      expect(result.getDate()).toBe(30)
    })

    it('should handle month overflow', () => {
      const date = new Date(2026, 5, 28)
      const result = addDays(date, 5)
      expect(result.getMonth()).toBe(6) // July
      expect(result.getDate()).toBe(3)
    })

    it('should handle negative days', () => {
      const date = new Date(2026, 5, 23)
      const result = addDays(date, -7)
      expect(result.getDate()).toBe(16)
    })
  })
})
