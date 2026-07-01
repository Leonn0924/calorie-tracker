import { computed } from 'vue'
import type { DrinkRecord, DailyDrinkStats } from '@/types'
import { storage } from '@/utils/storage'
import { getToday, formatTime } from '@/utils/date'

const DRINK_RECORDS_KEY = 'drink_records'
const DEFAULT_DRINK_GOAL = 2000 // 默认 2000ml

export type DrinkType = 'water' | 'coffee' | 'tea' | 'juice' | 'milk' | 'soda' | 'other'

// 饮品类型配置
export const DRINK_TYPES = {
  water: { label: '水', icon: 'water', color: 'text-blue-500' },
  coffee: { label: '咖啡', icon: 'coffee', color: 'text-amber-700' },
  tea: { label: '茶', icon: 'tea', color: 'text-green-600' },
  juice: { label: '果汁', icon: 'juice', color: 'text-orange-500' },
  milk: { label: '牛奶', icon: 'milk', color: 'text-blue-100' },
  soda: { label: '汽水', icon: 'soda', color: 'text-red-500' },
  other: { label: '其他', icon: 'other', color: 'text-gray-500' },
} as const

export function useWater() {
  // 获取今日饮品记录
  const todayRecords = computed(() => {
    const all = storage.get<DrinkRecord[]>(DRINK_RECORDS_KEY) || []
    const today = getToday()
    return all.filter(r => r.createdAt.startsWith(today))
  })

  // 今日总水量
  const todayTotal = computed(() => {
    return todayRecords.value.reduce((sum, r) => sum + r.amount, 0)
  })

  // 目标水量
  const waterGoal = computed(() => {
    const settings = storage.get<any>('settings')
    return settings?.waterGoal || DEFAULT_DRINK_GOAL
  })

  // 进度百分比
  const progress = computed(() => {
    return Math.min(100, Math.round((todayTotal.value / waterGoal.value) * 100))
  })

  // 按类型统计
  const byType = computed(() => {
    const stats = {
      water: 0,
      coffee: 0,
      tea: 0,
      juice: 0,
      milk: 0,
      soda: 0,
      other: 0,
    }

    todayRecords.value.forEach(r => {
      stats[r.type] += r.amount
    })

    return stats
  })

  // 添加饮品记录
  function addWater(amount: number, type: DrinkType = 'water', note?: string) {
    const record: DrinkRecord = {
      id: Date.now().toString(),
      type,
      amount,
      time: formatTime(new Date()),
      note,
      createdAt: new Date().toISOString(),
    }

    const all = storage.get<DrinkRecord[]>(DRINK_RECORDS_KEY) || []
    all.push(record)
    storage.set(DRINK_RECORDS_KEY, all)

    return record
  }

  // 删除饮品记录
  function removeWater(id: string) {
    const all = storage.get<DrinkRecord[]>(DRINK_RECORDS_KEY) || []
    const filtered = all.filter(r => r.id !== id)
    storage.set(DRINK_RECORDS_KEY, filtered)
  }

  // 清空今日记录
  function clearToday() {
    const all = storage.get<DrinkRecord[]>(DRINK_RECORDS_KEY) || []
    const today = getToday()
    const filtered = all.filter(r => !r.createdAt.startsWith(today))
    storage.set(DRINK_RECORDS_KEY, filtered)
  }

  // 获取今日统计
  const todayStats = computed<DailyDrinkStats>(() => ({
    total: todayTotal.value,
    records: todayRecords.value,
    goal: waterGoal.value,
    progress: progress.value,
    byType: byType.value,
  }))

  return {
    todayRecords,
    todayTotal,
    waterGoal,
    progress,
    todayStats,
    addWater,
    removeWater,
    clearToday,
    DRINK_TYPES,
  }
}
