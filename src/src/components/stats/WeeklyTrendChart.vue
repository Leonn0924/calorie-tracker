<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">缺口趋势</h3>

      <!-- 周期切换按钮 -->
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          @click="$emit('update:period', 'week')"
          :class="period === 'week' ? 'bg-health-green text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
        >
          本周
        </button>
        <button
          @click="$emit('update:period', 'month')"
          :class="period === 'month' ? 'bg-health-green text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
        >
          本月
        </button>
      </div>
    </div>

    <!-- 本周视图：条形图 -->
    <div v-if="period === 'week'" class="space-y-3">
      <div
        v-for="day in stats"
        :key="day.date"
        class="flex items-center gap-3"
      >
        <!-- 日期 -->
        <div class="w-20 text-sm text-gray-500">{{ formatDate(day.date) }}</div>

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
          <span v-else-if="day.status === 'near_limit'">️</span>
          <span v-else>❌</span>
        </div>
      </div>
    </div>

    <!-- 本月视图：日历热力图 -->
    <div v-else class="space-y-4">
      <!-- 月份导航 -->
      <div class="flex items-center justify-between mb-3">
        <button
          @click="previousMonth"
          class="px-2.5 py-1 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
        >
          ← 上月
        </button>
        <span class="font-medium text-gray-800 text-sm">{{ currentMonthLabel }}</span>
        <button
          @click="nextMonth"
          class="px-2.5 py-1 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
        >
          下月 →
        </button>
      </div>

      <!-- 星期标题 -->
      <div class="grid grid-cols-7 gap-1.5 text-center text-xs text-gray-500 mb-1.5">
        <div>一</div>
        <div>二</div>
        <div>三</div>
        <div>四</div>
        <div>五</div>
        <div>六</div>
        <div>日</div>
      </div>

      <!-- 日历网格 -->
      <div class="grid grid-cols-7 gap-1.5">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          :class="[
            'aspect-square rounded-lg flex flex-col items-center justify-center p-1.5 transition-all',
            day.isCurrentMonth ? 'cursor-pointer hover:scale-105' : 'opacity-30',
            getStatusClass(day.status)
          ]"
          :title="day.date ? `${formatDate(day.date)}: ${getStatusLabel(day.status)}` : ''"
        >
          <span class="text-xs font-medium" :class="day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'">
            {{ day.dayNumber }}
          </span>
          <span v-if="day.isCurrentMonth && day.status" class="text-sm mt-0.5">
            {{ getStatusIcon(day.status) }}
          </span>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
        <div class="text-center">
          <div class="flex items-center justify-center gap-1 mb-1">
            <div class="w-2.5 h-2.5 rounded bg-green-500"></div>
            <span class="text-xs text-gray-600">达标</span>
          </div>
          <div class="text-base font-bold text-gray-800">{{ monthStats.inDeficitDays }}</div>
          <div class="text-xs text-gray-500">天</div>
        </div>
        <div class="text-center">
          <div class="flex items-center justify-center gap-1 mb-1">
            <div class="w-2.5 h-2.5 rounded bg-yellow-500"></div>
            <span class="text-xs text-gray-600">接近</span>
          </div>
          <div class="text-base font-bold text-gray-800">{{ monthStats.nearLimitDays }}</div>
          <div class="text-xs text-gray-500">天</div>
        </div>
        <div class="text-center">
          <div class="flex items-center justify-center gap-1 mb-1">
            <div class="w-2.5 h-2.5 rounded bg-red-500"></div>
            <span class="text-xs text-gray-600">超支</span>
          </div>
          <div class="text-base font-bold text-gray-800">{{ monthStats.overBudgetDays }}</div>
          <div class="text-xs text-gray-500">天</div>
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
        <div class="w-3 h-3 rounded bg-gray-200"></div>
        <span>无数据</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DeficitStatus } from '@/types'
import { formatDate, getDaysInMonth, getFirstDayOfMonth } from '@/utils/date'

type Period = 'week' | 'month'

interface Stat {
  date: string
  budget: number
  intake: number
  exercise: number
  netDeficit: number
  status: DeficitStatus
}

const props = defineProps<{
  stats: Stat[]
  period: Period
}>()

const emit = defineEmits<{
  'update:period': [value: Period]
}>()

// 当前显示的月份（用于日历视图）
const displayMonth = ref(new Date())

const maxCalories = computed(() => {
  const maxIntake = Math.max(...props.stats.map(d => d.intake))
  const maxBudget = Math.max(...props.stats.map(d => d.budget))
  return Math.max(maxIntake, maxBudget) * 1.2
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

// 日历相关计算
const currentMonthLabel = computed(() => {
  const year = displayMonth.value.getFullYear()
  const month = displayMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

// 生成日历网格数据
const calendarDays = computed(() => {
  const year = displayMonth.value.getFullYear()
  const month = displayMonth.value.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month) // 0=周日，1=周一，...

  // 调整到周一开始（周一=0，周日=6）
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  const days = []

  // 上月填充
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({
      date: null,
      dayNumber: daysInMonth - i,
      isCurrentMonth: false,
      status: null,
    })
  }

  // 当月日期
  const statsMap = new Map(props.stats.map(s => [s.date, s]))

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const stat = statsMap.get(date)

    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      status: stat?.status || null,
    })
  }

  // 下月填充（补齐 42 格，6 行）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: null,
      dayNumber: i,
      isCurrentMonth: false,
      status: null,
    })
  }

  return days
})

// 本月统计
const monthStats = computed(() => {
  const inDeficitDays = props.stats.filter(s => s.status === 'in_deficit').length
  const nearLimitDays = props.stats.filter(s => s.status === 'near_limit').length
  const overBudgetDays = props.stats.filter(s => s.status === 'over_budget').length

  return {
    inDeficitDays,
    nearLimitDays,
    overBudgetDays,
    totalDays: props.stats.length,
    achievementRate: props.stats.length > 0 ? Math.round((inDeficitDays / props.stats.length) * 100) : 0,
  }
})

function getStatusClass(status: DeficitStatus | null) {
  if (!status) return 'bg-gray-100'
  switch (status) {
    case 'in_deficit':
      return 'bg-green-100 hover:bg-green-200'
    case 'near_limit':
      return 'bg-yellow-100 hover:bg-yellow-200'
    case 'over_budget':
      return 'bg-red-100 hover:bg-red-200'
    default:
      return 'bg-gray-100'
  }
}

function getStatusIcon(status: DeficitStatus | null) {
  if (!status) return ''
  switch (status) {
    case 'in_deficit':
      return '✅'
    case 'near_limit':
      return '⚠️'
    case 'over_budget':
      return '❌'
    default:
      return ''
  }
}

function getStatusLabel(status: DeficitStatus | null) {
  if (!status) return '无数据'
  switch (status) {
    case 'in_deficit':
      return '缺口达成'
    case 'near_limit':
      return '接近上限'
    case 'over_budget':
      return '已超支'
    default:
      return '未知'
  }
}

function previousMonth() {
  const newDate = new Date(displayMonth.value)
  newDate.setMonth(newDate.getMonth() - 1)
  displayMonth.value = newDate
}

function nextMonth() {
  const newDate = new Date(displayMonth.value)
  newDate.setMonth(newDate.getMonth() + 1)
  displayMonth.value = newDate
}
</script>
