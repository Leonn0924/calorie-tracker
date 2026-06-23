import { ref, computed } from 'vue'
import type { ExerciseRecord } from '@/types'
import { storage } from '@/utils/storage'
import { getToday } from '@/utils/date'

const EXERCISES_KEY = 'exercises'

export function useExercise() {
  // 从存储中加载所有运动记录
  const allExercises = ref<ExerciseRecord[]>(
    storage.get<ExerciseRecord[]>(EXERCISES_KEY) || []
  )

  // 今天的运动记录
  const todayExercises = computed(() => {
    const today = getToday()
    return allExercises.value.filter(ex => ex.date === today)
  })

  // 今天的总运动消耗
  const todayExerciseCalories = computed(() => {
    return todayExercises.value.reduce((sum, ex) => sum + ex.calories, 0)
  })

  /**
   * 添加运动记录
   */
  function addExercise(exercise: Omit<ExerciseRecord, 'id' | 'createdAt'>) {
    const newExercise: ExerciseRecord = {
      ...exercise,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    allExercises.value.push(newExercise)
    storage.set(EXERCISES_KEY, allExercises.value)
  }

  /**
   * 删除运动记录
   */
  function removeExercise(id: string) {
    const index = allExercises.value.findIndex(ex => ex.id === id)
    if (index !== -1) {
      allExercises.value.splice(index, 1)
      storage.set(EXERCISES_KEY, allExercises.value)
    }
  }

  /**
   * 获取指定日期的运动记录
   */
  function getExercisesByDate(date: string): ExerciseRecord[] {
    return allExercises.value.filter(ex => ex.date === date)
  }

  /**
   * 获取指定日期的运动消耗
   */
  function getExerciseCaloriesByDate(date: string): number {
    return getExercisesByDate(date).reduce((sum, ex) => sum + ex.calories, 0)
  }

  /**
   * 清空今天的运动记录
   */
  function clearTodayExercises() {
    const today = getToday()
    allExercises.value = allExercises.value.filter(ex => ex.date !== today)
    storage.set(EXERCISES_KEY, allExercises.value)
  }

  return {
    allExercises,
    todayExercises,
    todayExerciseCalories,
    addExercise,
    removeExercise,
    getExercisesByDate,
    getExerciseCaloriesByDate,
    clearTodayExercises,
  }
}
