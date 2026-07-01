import { computed } from 'vue'
import type { WaterRecord, DailyWaterStats } from '@/types'
import { storage } from '@/utils/storage'
import { getToday, formatTime } from '@/utils/date'

const WATER_RECORDS_KEY = 'water_records'
const DEFAULT_WATER_GOAL = 2000 // 默认 2000ml

export function useWater() {
  // 获取今日喝水记录
  const todayRecords = computed(() => {
    const all = storage.get<WaterRecord[]>(WATER_RECORDS_KEY) || []
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
    return settings?.waterGoal || DEFAULT_WATER_GOAL
  })

  // 进度百分比
  const progress = computed(() => {
    return Math.min(100, Math.round((todayTotal.value / waterGoal.value) * 100))
  })

  // 添加喝水记录
  function addWater(amount: number, note?: string) {
    const record: WaterRecord = {
      id: Date.now().toString(),
      amount,
      time: formatTime(new Date()),
      note,
      createdAt: new Date().toISOString(),
    }

    const all = storage.get<WaterRecord[]>(WATER_RECORDS_KEY) || []
    all.push(record)
    storage.set(WATER_RECORDS_KEY, all)

    return record
  }

  // 删除喝水记录
  function removeWater(id: string) {
    const all = storage.get<WaterRecord[]>(WATER_RECORDS_KEY) || []
    const filtered = all.filter(r => r.id !== id)
    storage.set(WATER_RECORDS_KEY, filtered)
  }

  // 清空今日记录
  function clearToday() {
    const all = storage.get<WaterRecord[]>(WATER_RECORDS_KEY) || []
    const today = getToday()
    const filtered = all.filter(r => !r.createdAt.startsWith(today))
    storage.set(WATER_RECORDS_KEY, filtered)
  }

  // 获取今日统计
  const todayStats = computed<DailyWaterStats>(() => ({
    total: todayTotal.value,
    records: todayRecords.value,
    goal: waterGoal.value,
    progress: progress.value,
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
  }
}
