<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">数据统计</h1>
      <div class="text-sm text-gray-500">最近 7 天</div>
    </div>

    <!-- 今日缺口 + 本周达成率 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TodayGapCard :gap="todayGap" />
      <AchievementRate :achievement="achievementRate" />
    </div>

    <!-- 三餐热量分布 -->
    <MealDistributionChart :distribution="mealDistribution" />

    <!-- 七日缺口趋势 -->
    <WeeklyTrendChart :weekly-stats="weeklyStats" />

    <!-- 本周汇总 -->
    <WeeklySummaryCard
      :weekly-average-intake="weeklyAverageIntake"
      :weekly-average-exercise="weeklyAverageExercise"
      :weekly-average-deficit="weeklyAverageDeficit"
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
  weeklyStats,
  todayGap,
  mealDistribution,
  achievementRate,
  weeklyAverageIntake,
  weeklyAverageExercise,
  weeklyAverageDeficit,
} = useStats()
</script>
