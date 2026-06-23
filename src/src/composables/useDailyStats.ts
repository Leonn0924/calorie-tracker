import { ref, computed } from 'vue'
import type { DailyStats, MealRecord, ExerciseRecord, DeficitStatus } from '@/types'
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

export function useDailyStats() {
  const { settings } = useSettings()

  // 从存储中加载今日数据
  const today = getToday()
  const allMeals = ref<MealRecord[]>(storage.get<MealRecord[]>(MEALS_KEY) || [])
  const allExercises = ref<ExerciseRecord[]>(storage.get<ExerciseRecord[]>(EXERCISES_KEY) || [])

  // 过滤今日数据
  const todayMeals = computed(() =>
    allMeals.value.filter(m => m.date === today)
  )

  const todayExercises = computed(() =>
    allExercises.value.filter(e => e.date === today)
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
  function addMeal(meal: Omit<MealRecord, 'id' | 'createdAt' | 'calories'>) {
    const calories = calculateCalories(meal.caloriesPer100g, meal.grams)
    const newMeal: MealRecord = {
      ...meal,
      id: crypto.randomUUID(),
      calories,
      createdAt: new Date().toISOString(),
    }

    allMeals.value.push(newMeal)
    storage.set(MEALS_KEY, allMeals.value)
  }

  // 删除饮食记录
  function removeMeal(id: string) {
    allMeals.value = allMeals.value.filter(m => m.id !== id)
    storage.set(MEALS_KEY, allMeals.value)
  }

  // 更新饮食记录
  function updateMeal(id: string, updates: Partial<MealRecord>) {
    const index = allMeals.value.findIndex(m => m.id === id)
    if (index !== -1) {
      allMeals.value[index] = { ...allMeals.value[index], ...updates }
      if (updates.caloriesPer100g || updates.grams) {
        allMeals.value[index].calories = calculateCalories(
          allMeals.value[index].caloriesPer100g,
          allMeals.value[index].grams
        )
      }
      storage.set(MEALS_KEY, allMeals.value)
    }
  }

  // 添加运动记录
  function addExercise(exercise: Omit<ExerciseRecord, 'id' | 'createdAt'>) {
    const newExercise: ExerciseRecord = {
      ...exercise,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    allExercises.value.push(newExercise)
    storage.set(EXERCISES_KEY, allExercises.value)
  }

  // 删除运动记录
  function removeExercise(id: string) {
    allExercises.value = allExercises.value.filter(e => e.id !== id)
    storage.set(EXERCISES_KEY, allExercises.value)
  }

  // 清空今日数据
  function clearToday() {
    allMeals.value = allMeals.value.filter(m => m.date !== today)
    allExercises.value = allExercises.value.filter(e => e.date !== today)
    storage.set(MEALS_KEY, allMeals.value)
    storage.set(EXERCISES_KEY, allExercises.value)
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
  }
}