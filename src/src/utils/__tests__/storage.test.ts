import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '../storage'

// 创建一个简单的内存存储来模拟 localStorage
const mockStorage: Record<string, string> = {}

// Mock localStorage，使其支持 Object.keys
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key]
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
  }),
  // 使 Object.keys 能够遍历
  [Symbol.iterator]: function* () {
    for (const key of Object.keys(mockStorage)) {
      yield key
    }
  },
}

// 使 Object.keys(localStorage) 返回正确的键
Object.defineProperty(localStorageMock, 'keys', {
  value: () => Object.keys(mockStorage),
})

// 在测试前设置全局 localStorage
;(globalThis as any).localStorage = localStorageMock

describe('Storage Utils', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
    vi.clearAllMocks()
  })

  describe('get/set', () => {
    it('should set and get string value', () => {
      storage.set('test-key', 'test-value')
      expect(storage.get('test-key')).toBe('test-value')
    })

    it('should set and get object value', () => {
      const obj = { name: 'test', value: 123 }
      storage.set('test-obj', obj)
      expect(storage.get('test-obj')).toEqual(obj)
    })

    it('should set and get array value', () => {
      const arr = [1, 2, 3, 'test']
      storage.set('test-arr', arr)
      expect(storage.get('test-arr')).toEqual(arr)
    })

    it('should return null for non-existent key', () => {
      expect(storage.get('non-existent')).toBeNull()
    })
  })

  describe('remove', () => {
    it('should remove existing key', () => {
      storage.set('test-key', 'test-value')
      storage.remove('test-key')
      expect(storage.get('test-key')).toBeNull()
    })

    it('should not throw when removing non-existent key', () => {
      expect(() => storage.remove('non-existent')).not.toThrow()
    })
  })
})
