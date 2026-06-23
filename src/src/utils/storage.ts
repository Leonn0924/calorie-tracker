import LZString from 'lz-string'

const STORAGE_PREFIX = 'calorie-tracker.'

/**
 * LocalStorage 存储工具（支持 lz-string 压缩）
 */
export const storage = {
  /**
   * 读取数据
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = STORAGE_PREFIX + key
      const compressed = localStorage.getItem(fullKey)
      if (!compressed) return null

      const decompressed = LZString.decompressFromUTF16(compressed)
      if (!decompressed) return null

      return JSON.parse(decompressed) as T
    } catch (error) {
      console.error(`Storage get error [${key}]:`, error)
      return null
    }
  },

  /**
   * 写入数据
   */
  set<T>(key: string, value: T): boolean {
    try {
      const fullKey = STORAGE_PREFIX + key
      const json = JSON.stringify(value)
      const compressed = LZString.compressToUTF16(json)
      localStorage.setItem(fullKey, compressed)
      return true
    } catch (error) {
      console.error(`Storage set error [${key}]:`, error)
      return false
    }
  },

  /**
   * 删除数据
   */
  remove(key: string): void {
    try {
      const fullKey = STORAGE_PREFIX + key
      localStorage.removeItem(fullKey)
    } catch (error) {
      console.error(`Storage remove error [${key}]:`, error)
    }
  },

  /**
   * 清空所有应用数据
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  },

  /**
   * 获取存储使用情况
   */
  getUsage(): { used: number; total: number; percentage: number } {
    let total = 0
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX))
    keys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        total += value.length * 2 // UTF-16 字符占 2 字节
      }
    })

    const totalMB = 5 * 1024 * 1024 // 5MB
    const usedMB = total
    const percentage = (usedMB / totalMB) * 100

    return {
      used: usedMB,
      total: totalMB,
      percentage
    }
  }
}