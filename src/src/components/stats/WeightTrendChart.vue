<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">体重趋势</h3>

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
    <div v-if="filteredWeights.length > 0" class="relative h-64">
      <Line
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="h-64 flex items-center justify-center text-gray-400">
      <div class="text-center">
        <Icons name="chart-bar" size="xl" class="mx-auto mb-2 opacity-50" />
        <p class="text-sm">暂无体重数据</p>
        <p class="text-xs mt-1">添加体重记录后查看趋势</p>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="stats" class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
      <div>
        <div class="text-xs text-gray-500 mb-1">当前体重</div>
        <div class="text-lg font-bold text-gray-800">{{ stats.current }}<span class="text-xs text-gray-500 ml-1">kg</span></div>
      </div>
      <div>
        <div class="text-xs text-gray-500 mb-1">总变化</div>
        <div class="text-lg font-bold" :class="stats.change > 0 ? 'text-red-600' : 'text-green-600'">
          {{ stats.change > 0 ? '+' : '' }}{{ stats.change.toFixed(1) }}
          <span class="text-xs text-gray-500 ml-1">kg</span>
        </div>
      </div>
      <div>
        <div class="text-xs text-gray-500 mb-1">距目标</div>
        <div class="text-lg font-bold text-health-600">
          {{ stats.remaining.toFixed(1) }}
          <span class="text-xs text-gray-500 ml-1">kg</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale } from 'chart.js'
import { useWeight } from '@/composables/useWeight'
import { useSettings } from '@/composables/useSettings'
import Icons from '@/components/icons/Icons.vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)

const { sortedWeights } = useWeight()
const { settings } = useSettings()

const selectedRange = ref<'week' | 'month' | 'quarter'>('month')

const timeRanges = [
  { label: '本周', value: 'week' as const },
  { label: '本月', value: 'month' as const },
  { label: '三月', value: 'quarter' as const },
]

// 过滤数据
const filteredWeights = computed(() => {
  const now = new Date()
  const days = selectedRange.value === 'week' ? 7 : selectedRange.value === 'month' ? 30 : 90

  return sortedWeights.value.filter(record => {
    const recordDate = new Date(record.date)
    const diffTime = now.getTime() - recordDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= days
  }).reverse()
})

// 图表数据
const chartData = computed(() => {
  if (filteredWeights.value.length === 0) return { labels: [] as string[], datasets: [] }

  const labels = filteredWeights.value.map(w => {
    const date = new Date(w.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  const weights = filteredWeights.value.map(w => w.weight)

  return {
    labels,
    datasets: [
      {
        label: '体重 (kg)',
        data: weights,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

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
          return `${context.parsed.y} kg`
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
      },
    },
    y: {
      grid: {
        color: '#F3F4F6',
      },
      ticks: {
        font: { size: 10 },
        color: '#9CA3AF',
        callback: (value: any) => `${value} kg`,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
}))

// 统计信息
const stats = computed(() => {
  if (filteredWeights.value.length === 0) return null

  const current = filteredWeights.value[filteredWeights.value.length - 1].weight
  const first = filteredWeights.value[0].weight
  const change = current - first
  const target = settings.value.targetWeight || current
  const remaining = current - target

  return {
    current,
    change,
    remaining,
  }
})
</script>
