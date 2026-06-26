<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">热量摄入趋势</h3>

      <!-- 时间范围切换 -->
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          @click="selectedRange = range.value"
          :class="selectedRange === range.value ? 'bg-health-green text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- 图表区域 -->
    <div v-if="chartData.labels.length > 0" class="relative h-64">
      <Bar
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="h-64 flex items-center justify-center text-gray-400">
      <div class="text-center">
        <Icons name="chart-bar" size="xl" class="mx-auto mb-2 opacity-50" />
        <p class="text-sm">暂无饮食记录</p>
        <p class="text-xs mt-1">添加饮食记录后查看趋势</p>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="stats" class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
      <div>
        <div class="text-xs text-gray-500 mb-1">平均摄入</div>
        <div class="text-lg font-bold text-gray-800">{{ stats.avgIntake }}<span class="text-xs text-gray-500 ml-1">kcal</span></div>
      </div>
      <div>
        <div class="text-xs text-gray-500 mb-1">平均缺口</div>
        <div class="text-lg font-bold" :class="stats.avgDeficit >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ stats.avgDeficit > 0 ? '+' : '' }}{{ stats.avgDeficit }}
          <span class="text-xs text-gray-500 ml-1">kcal</span>
        </div>
      </div>
      <div>
        <div class="text-xs text-gray-500 mb-1">达标天数</div>
        <div class="text-lg font-bold text-health-600">{{ stats.successDays }}<span class="text-xs text-gray-500 ml-1">天</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale } from 'chart.js'
import { useDailyStats } from '@/composables/useDailyStats'
import { useSettings } from '@/composables/useSettings'
import Icons from '@/components/icons/Icons.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale)

const { getMealsByDate, getExercisesByDate } = useDailyStats()
const { settings } = useSettings()

const selectedRange = ref<'week' | 'month' | 'quarter'>('week')

const timeRanges = [
  { label: '本周', value: 'week' as const },
  { label: '本月', value: 'month' as const },
  { label: '三月', value: 'quarter' as const },
]

// 获取日期范围
const dateRange = computed(() => {
  const now = new Date()
  const days = selectedRange.value === 'week' ? 7 : selectedRange.value === 'month' ? 30 : 90
  const dates = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dates.push({
      date: dateStr,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
    })
  }

  return dates
})

// 计算每日数据
const dailyData = computed(() => {
  return dateRange.value.map(({ date, label }) => {
    const meals = getMealsByDate(date)
    const exercises = getExercisesByDate(date)
    const intake = meals.reduce((sum, meal) => sum + meal.calories, 0)
    const exercise = exercises.reduce((sum, ex) => sum + ex.calories, 0)
    const budget = settings.value.dailyBudget
    const deficit = budget + exercise - intake

    return {
      date,
      label,
      intake,
      exercise,
      budget,
      deficit,
      isSuccess: intake <= budget,
    }
  })
})

// 图表数据
const chartData = computed(() => ({
  labels: dailyData.value.map(d => d.label),
  datasets: [
    {
      label: '摄入',
      data: dailyData.value.map(d => d.intake),
      backgroundColor: dailyData.value.map(d => d.isSuccess ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
      borderRadius: 4,
    },
  ],
}))

// 图表配置
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 12 },
      bodyFont: { size: 14 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          const data = dailyData.value[context.dataIndex]
          return [
            `摄入：${data.intake} kcal`,
            `预算：${data.budget} kcal`,
            `缺口：${data.deficit > 0 ? '+' : ''}${data.deficit} kcal`,
          ]
        },
      },
    },
    annotation: {
      annotations: {
        budgetLine: {
          type: 'line',
          yMin: dailyData.value[0]?.budget || 0,
          yMax: dailyData.value[0]?.budget || 0,
          borderColor: '#9CA3AF',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            display: true,
            content: '预算',
            position: 'end',
          },
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: { size: 10 },
        color: '#9CA3AF',
        maxRotation: 45,
      },
    },
    y: {
      grid: {
        color: '#F3F4F6',
      },
      ticks: {
        font: { size: 10 },
        color: '#9CA3AF',
        callback: (value: any) => `${value} kcal`,
      },
    },
  },
}))

// 统计信息
const stats = computed(() => {
  if (dailyData.value.length === 0) return null

  const totalIntake = dailyData.value.reduce((sum, d) => sum + d.intake, 0)
  const avgIntake = Math.round(totalIntake / dailyData.value.length)
  const totalDeficit = dailyData.value.reduce((sum, d) => sum + d.deficit, 0)
  const avgDeficit = Math.round(totalDeficit / dailyData.value.length)
  const successDays = dailyData.value.filter(d => d.isSuccess).length

  return {
    avgIntake,
    avgDeficit,
    successDays,
  }
})
</script>
