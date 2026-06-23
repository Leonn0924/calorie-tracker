import { ref, computed } from 'vue'
import type { WeightRecord } from '@/types'
import { storage } from '@/utils/storage'
import { getToday, getRecentDates } from '@/utils/date'

const WEIGHTS_KEY = 'weights'

export function useWeight() {
  // 从存储中加载所有体重记录
  const allWeights = ref<WeightRecord[]>(
    storage.get<WeightRecord[]>(WEIGHTS_KEY) || []
  )

  // 按日期排序（最新在前）
  const sortedWeights = computed(() => {
    return [...allWeights.value].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })

  // 最近的体重记录
  const latestWeight = computed(() => {
    if (sortedWeights.value.length === 0) return null
    return sortedWeights.value[0]
  })

  // 最近 7 天的体重记录
  const recentWeights = computed(() => {
    const recentDates = getRecentDates(7)
    return recentDates.map(date => {
      const record = allWeights.value.find(w => w.date === date)
      return {
        date,
        weight: record?.weight || null,
      }
    }).reverse() // 按时间顺序（旧到新）
  })

  /**
   * 添加或更新体重记录
   */
  function addWeight(weight: number, date?: string) {
    const recordDate = date || getToday()

    // 检查是否已存在该日期的记录
    const existingIndex = allWeights.value.findIndex(w => w.date === recordDate)

    if (existingIndex !== -1) {
      // 更新现有记录
      allWeights.value[existingIndex].weight = weight
      allWeights.value[existingIndex].createdAt = new Date().toISOString()
    } else {
      // 添加新记录
      const newRecord: WeightRecord = {
        id: crypto.randomUUID(),
        date: recordDate,
        weight,
        createdAt: new Date().toISOString(),
      }
      allWeights.value.push(newRecord)
    }

    storage.set(WEIGHTS_KEY, allWeights.value)
  }

  /**
   * 删除体重记录
   */
  function removeWeight(id: string) {
    const index = allWeights.value.findIndex(w => w.id === id)
    if (index !== -1) {
      allWeights.value.splice(index, 1)
      storage.set(WEIGHTS_KEY, allWeights.value)
    }
  }

  /**
   * 获取指定日期的体重
   */
  function getWeightByDate(date: string): number | null {
    const record = allWeights.value.find(w => w.date === date)
    return record?.weight || null
  }

  /**
   * 计算体重变化
   */
  function getWeightChange(): { absolute: number; percentage: number } | null {
    if (sortedWeights.value.length < 2) return null

    const latest = sortedWeights.value[0].weight
    const oldest = sortedWeights.value[sortedWeights.value.length - 1].weight
    const absolute = latest - oldest
    const percentage = (absolute / oldest) * 100

    return { absolute, percentage }
  }

  /**
   * 清空所有体重记录
   */
  function clearAllWeights() {
    allWeights.value = []
    storage.set(WEIGHTS_KEY, allWeights.value)
  }

  return {
    allWeights,
    sortedWeights,
    latestWeight,
    recentWeights,
    addWeight,
    removeWeight,
    getWeightByDate,
    getWeightChange,
    clearAllWeights,
  }
}
