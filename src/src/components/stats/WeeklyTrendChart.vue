<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">七日缺口趋势</h3>

    <div class="space-y-3">
      <div
        v-for="day in weeklyStats"
        :key="day.date"
        class="flex items-center gap-3"
      >
        <!-- 日期 -->
        <div class="w-12 text-sm text-gray-500">{{ formatDate(day.date) }}</div>

        <!-- 柱状图 -->
        <div class="flex-1 flex items-center gap-2">
          <div class="flex-1 relative h-8 bg-gray-100 rounded overflow-hidden">
            <!-- 预算线 -->
            <div
              class="absolute left-0 top-0 h-full border-r-2 border-dashed border-gray-400"
              :style="{ left: `${(day.budget / maxCalories) * 100}%` }"
            ></div>

            <!-- 摄入条 -->
            <div
              class="absolute left-0 top-0 h-full transition-all"
              :class="getBarClass(day.status)"
              :style="{ width: `${Math.min((day.intake / maxCalories) * 100, 100)}%` }"
            >
              <div class="h-full flex items-center justify-end px-2">
                <span class="text-xs text-white font-medium">{{ day.intake }}</span>
              </div>
            </div>

            <!-- 运动消耗标记 -->
            <div
              v-if="day.exercise > 0"
              class="absolute top-0 h-full flex items-center"
              :style="{ left: `${Math.min((day.intake / maxCalories) * 100, 100)}%` }"
            >
              <div class="text-xs text-blue-500 font-medium ml-1">+{{ day.exercise }}</div>
            </div>
          </div>
        </div>

        <!-- 状态图标 -->
        <div class="w-8 text-center">
          <span v-if="day.status === 'in_deficit'">✅</span>
          <span v-else-if="day.status === 'near_limit'">⚠️</span>
          <span v-else>❌</span>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-green-500"></div>
        <span>缺口达成</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-yellow-500"></div>
        <span>接近上限</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-red-500"></div>
        <span>已超支</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-0.5 border-t-2 border-dashed border-gray-400"></div>
        <span>预算线</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DeficitStatus } from '@/types'
import { formatDate } from '@/utils/date'

interface WeeklyStat {
  date: string
  budget: number
  intake: number
  exercise: number
  netDeficit: number
  status: DeficitStatus
}

const props = defineProps<{
  weeklyStats: WeeklyStat[]
}>()

const maxCalories = computed(() => {
  const maxIntake = Math.max(...props.weeklyStats.map(d => d.intake))
  const maxBudget = Math.max(...props.weeklyStats.map(d => d.budget))
  return Math.max(maxIntake, maxBudget) * 1.2 // 留出 20% 空间
})

function getBarClass(status: DeficitStatus) {
  switch (status) {
    case 'in_deficit':
      return 'bg-green-500'
    case 'near_limit':
      return 'bg-yellow-500'
    case 'over_budget':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}
</script>
