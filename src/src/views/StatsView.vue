<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">数据统计</h1>
      <div class="text-sm text-gray-500">
        {{ period === 'week' ? '最近 7 天' : '最近 30 天' }}
      </div>
    </div>

    <!-- 今日缺口 + 达成率 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TodayGapCard :gap="todayGap" />
      <AchievementRate :achievement="achievementRate" />
    </div>

    <!-- 三餐热量分布 -->
    <MealDistributionChart :distribution="mealDistribution" />

    <!-- 缺口趋势（本周/本月切换） -->
    <WeeklyTrendChart
      :stats="currentPeriodStats"
      :period="period"
      @update:period="setPeriod"
    />

    <!-- 汇总卡片（本周/本月） -->
    <WeeklySummaryCard
      :period="period"
      :average-intake="averageIntake"
      :average-exercise="averageExercise"
      :average-deficit="averageDeficit"
    />
  </div>
</template>

<script setup lang="ts">
import { useStats } from '@/composables/useStats'
import TodayGapCard from '@/components/stats/TodayGapCard.vue'
import MealDistributionChart from '@/components/stats/MealDistributionChart.vue'
import WeeklyTrendChart from '@/components/stats/WeeklyTrendChart.vue'
import AchievementRate from '@/components/stats/AchievementRate.vue'
import WeeklySummaryCard from '@/components/stats/WeeklySummaryCard.vue'

const {
  period,
  currentPeriodStats,
  todayGap,
  mealDistribution,
  achievementRate,
  averageIntake,
  averageExercise,
  averageDeficit,
  setPeriod,
} = useStats()
</script>
