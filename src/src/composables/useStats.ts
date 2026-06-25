import { computed, ref } from 'vue'
import type { DeficitStatus } from '@/types'
import { useDailyStats } from './useDailyStats'
import { useSettings } from './useSettings'
import { getRecentDates } from '@/utils/date'

type Period = 'week' | 'month'

export function useStats() {
  const { dailyStats, getMealsByDate, getExercisesByDate } = useDailyStats()
  const { settings } = useSettings()

  // 当前选择的周期（本周/本月）
  const period = ref<Period>('week')

  // 最近 7 天的日期列表
  const recent7Days = computed(() => {
    return getRecentDates(7)
  })

  // 最近 30 天的日期列表
  const recent30Days = computed(() => {
    return getRecentDates(30)
  })

  // 当前周期的日期列表
  const currentPeriodDays = computed(() => {
    return period.value === 'week' ? recent7Days.value : recent30Days.value
  })

  // 当前周期的天数
  const currentPeriodTotalDays = computed(() => {
    return period.value === 'week' ? 7 : 30
  })

  // 当前周期的统计数据
  const currentPeriodStats = computed(() => {
    return currentPeriodDays.value.map(date => {
      const meals = getMealsByDate(date)
      const exercises = getExercisesByDate(date)
      const totalIntake = meals.reduce((sum, meal) => sum + meal.calories, 0)
      const totalExercise = exercises.reduce((sum, ex) => sum + ex.calories, 0)
      const budget = settings.value.dailyBudget
      const tdee = settings.value.tdee
      const netDeficit = budget + totalExercise - totalIntake

      let status: DeficitStatus
      if (totalIntake <= budget) {
        status = 'in_deficit'
      } else if (totalIntake <= tdee) {
        status = 'near_limit'
      } else {
        status = 'over_budget'
      }

      return {
        date,
        budget,
        intake: totalIntake,
        exercise: totalExercise,
        netDeficit,
        status,
      }
    })
  })

  // 今日缺口状态
  const todayGap = computed(() => {
    const today = dailyStats.value
    return {
      budget: today.budget,
      intake: today.intake,
      exercise: today.exercise,
      netDeficit: today.netDeficit,
      status: today.status,
      remaining: today.budget - today.intake,
    }
  })

  // 三餐热量分布
  const mealDistribution = computed(() => {
    const meals = dailyStats.value.meals
    const distribution = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    }

    meals.forEach(meal => {
      switch (meal.mealType) {
        case '早餐':
          distribution.breakfast += meal.calories
          break
        case '午餐':
          distribution.lunch += meal.calories
          break
        case '晚餐':
          distribution.dinner += meal.calories
          break
        case '加餐':
          distribution.snack += meal.calories
          break
      }
    })

    const total = distribution.breakfast + distribution.lunch + distribution.dinner + distribution.snack

    return {
      ...distribution,
      total,
      percentages: {
        breakfast: total > 0 ? (distribution.breakfast / total) * 100 : 0,
        lunch: total > 0 ? (distribution.lunch / total) * 100 : 0,
        dinner: total > 0 ? (distribution.dinner / total) * 100 : 0,
        snack: total > 0 ? (distribution.snack / total) * 100 : 0,
      },
    }
  })

  // 达成率统计
  const achievementRate = computed(() => {
    const inDeficitDays = currentPeriodStats.value.filter(day => day.status === 'in_deficit').length
    const totalDays = currentPeriodTotalDays.value
    const rate = (inDeficitDays / totalDays) * 100

    return {
      inDeficitDays,
      totalDays,
      rate: Math.round(rate),
    }
  })

  // 平均摄入
  const averageIntake = computed(() => {
    const totalIntake = currentPeriodStats.value.reduce((sum, day) => sum + day.intake, 0)
    return Math.round(totalIntake / currentPeriodTotalDays.value)
  })

  // 平均消耗
  const averageExercise = computed(() => {
    const totalExercise = currentPeriodStats.value.reduce((sum, day) => sum + day.exercise, 0)
    return Math.round(totalExercise / currentPeriodTotalDays.value)
  })

  // 平均净缺口
  const averageDeficit = computed(() => {
    const totalDeficit = currentPeriodStats.value.reduce((sum, day) => sum + day.netDeficit, 0)
    return Math.round(totalDeficit / currentPeriodTotalDays.value)
  })

  // 切换周期
  function setPeriod(newPeriod: Period) {
    period.value = newPeriod
  }

  return {
    period,
    currentPeriodDays,
    currentPeriodStats,
    currentPeriodTotalDays,
    todayGap,
    mealDistribution,
    achievementRate,
    averageIntake,
    averageExercise,
    averageDeficit,
    setPeriod,
  }
}
