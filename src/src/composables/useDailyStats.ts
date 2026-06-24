import { ref, computed } from 'vue'
import type { DailyStats, MealRecord, ExerciseRecord, DeficitStatus, MealType, RecordSource, Confidence } from '@/types'
import { storage } from '@/utils/storage'
import { getToday } from '@/utils/date'
import {
  calculateCalories,
  calculateNetDeficit,
  getDeficitStatus,
} from '@/utils/calculator'
import { useSettings } from './useSettings'

const MEALS_KEY = 'meals'
const EXERCISES_KEY = 'exercises'

// 全局状态，确保所有组件共享同一个数据
const today = getToday()
const globalAllMeals = ref<MealRecord[]>(storage.get<MealRecord[]>(MEALS_KEY) || [])
const globalAllExercises = ref<ExerciseRecord[]>(storage.get<ExerciseRecord[]>(EXERCISES_KEY) || [])

export function useDailyStats() {
  const { settings } = useSettings()

  // 过滤今日数据
  const todayMeals = computed(() =>
    globalAllMeals.value.filter(m => m.date === today)
  )

  const todayExercises = computed(() =>
    globalAllExercises.value.filter(e => e.date === today)
  )

  // 计算今日统计
  const totalIntake = computed(() =>
    todayMeals.value.reduce((sum, meal) => sum + meal.calories, 0)
  )

  const totalExercise = computed(() =>
    todayExercises.value.reduce((sum, ex) => sum + ex.calories, 0)
  )

  const netDeficit = computed(() =>
    calculateNetDeficit(
      settings.value.dailyBudget,
      totalIntake.value,
      totalExercise.value
    )
  )

  const status = computed<DeficitStatus>(() =>
    getDeficitStatus(totalIntake.value, settings.value.dailyBudget, settings.value.tdee)
  )

  const dailyStats = computed<DailyStats>(() => ({
    date: today,
    budget: settings.value.dailyBudget,
    intake: totalIntake.value,
    exercise: totalExercise.value,
    netDeficit: netDeficit.value,
    status: status.value,
    meals: todayMeals.value,
    exercises: todayExercises.value,
  }))

  // 添加饮食记录
  function addMeal(meal: {
    date: string
    mealType: MealType
    foodId: string
    foodName: string
    caloriesPer100g: number
    grams: number
    source: RecordSource
    confidence?: Confidence
    rawInput?: string
    calories?: number // 可选，不提供则自动计算
  }) {
    // 如果没有提供 calories，自动计算
    const calories = meal.calories || calculateCalories(meal.caloriesPer100g, meal.grams)
    const newMeal: MealRecord = {
      id: crypto.randomUUID(),
      date: meal.date,
      mealType: meal.mealType,
      foodId: meal.foodId,
      foodName: meal.foodName,
      caloriesPer100g: meal.caloriesPer100g,
      grams: meal.grams,
      calories,
      source: meal.source,
      confidence: meal.confidence,
      rawInput: meal.rawInput,
      createdAt: new Date().toISOString(),
    }

    globalAllMeals.value.push(newMeal)
    storage.set(MEALS_KEY, globalAllMeals.value)
  }

  // 删除饮食记录
  function removeMeal(id: string) {
    globalAllMeals.value = globalAllMeals.value.filter(m => m.id !== id)
    storage.set(MEALS_KEY, globalAllMeals.value)
  }

  // 更新饮食记录
  function updateMeal(id: string, updates: Partial<MealRecord>) {
    const index = globalAllMeals.value.findIndex(m => m.id === id)
    if (index !== -1) {
      globalAllMeals.value[index] = { ...globalAllMeals.value[index], ...updates }
      if (updates.caloriesPer100g || updates.grams) {
        globalAllMeals.value[index].calories = calculateCalories(
          globalAllMeals.value[index].caloriesPer100g,
          globalAllMeals.value[index].grams
        )
      }
      storage.set(MEALS_KEY, globalAllMeals.value)
    }
  }

  // 添加运动记录
  function addExercise(exercise: Omit<ExerciseRecord, 'id' | 'createdAt'>) {
    const newExercise: ExerciseRecord = {
      ...exercise,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    globalAllExercises.value.push(newExercise)
    storage.set(EXERCISES_KEY, globalAllExercises.value)
  }

  // 删除运动记录
  function removeExercise(id: string) {
    globalAllExercises.value = globalAllExercises.value.filter(e => e.id !== id)
    storage.set(EXERCISES_KEY, globalAllExercises.value)
  }

  // 清空今日数据
  function clearToday() {
    globalAllMeals.value = globalAllMeals.value.filter(m => m.date !== today)
    globalAllExercises.value = globalAllExercises.value.filter(e => e.date !== today)
    storage.set(MEALS_KEY, globalAllMeals.value)
    storage.set(EXERCISES_KEY, globalAllExercises.value)
  }

  // 按日期获取饮食记录
  function getMealsByDate(date: string): MealRecord[] {
    return globalAllMeals.value.filter(m => m.date === date)
  }

  // 按日期获取运动记录
  function getExercisesByDate(date: string): ExerciseRecord[] {
    return globalAllExercises.value.filter(e => e.date === date)
  }

  return {
    dailyStats,
    todayMeals,
    todayExercises,
    totalIntake,
    totalExercise,
    netDeficit,
    status,
    addMeal,
    removeMeal,
    updateMeal,
    addExercise,
    removeExercise,
    clearToday,
    getMealsByDate,
    getExercisesByDate,
  }
}