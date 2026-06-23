<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      今日概览
    </h3>

    <!-- 进度环 -->
    <div class="flex items-center justify-center mb-6">
      <div class="relative w-40 h-40">
        <svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
          <!-- 背景圆环 -->
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            stroke-width="8"
          />
          <!-- 预算圆环（蓝色） -->
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            :stroke="budgetRingColor"
            stroke-width="8"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="budgetOffset"
            stroke-linecap="round"
            class="transition-all duration-500"
          />
          <!-- TDEE 圆环（灰色虚线） -->
          <circle
            cx="50"
            cy="50"
            r="37"
            fill="none"
            stroke="#D1D5DB"
            stroke-width="2"
            stroke-dasharray="4 4"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-3xl font-bold" :class="statusColor">
            {{ progressPercentage }}%
          </div>
          <div class="text-xs text-gray-500 mt-1">已用预算</div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="flex items-center justify-center gap-6 mb-6 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: budgetRingColor }"></div>
        <span class="text-gray-600">饮食预算</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-0.5 bg-gray-300"></div>
        <span class="text-gray-600">TDEE</span>
      </div>
    </div>

    <!-- 数据卡片 -->
    <div class="grid grid-cols-2 gap-4">
      <!-- 预算 -->
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-2 mb-1">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="text-xs text-gray-500">饮食预算</span>
        </div>
        <div class="text-xl font-bold text-gray-800">{{ budget }} kcal</div>
      </div>

      <!-- 已摄入 -->
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-2 mb-1">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-xs text-gray-500">已摄入</span>
        </div>
        <div class="text-xl font-bold" :class="intakeColor">{{ intake }} kcal</div>
      </div>

      <!-- 运动消耗 -->
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-2 mb-1">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span class="text-xs text-gray-500">运动消耗</span>
        </div>
        <div class="text-xl font-bold text-health-600">{{ exercise }} kcal</div>
      </div>

      <!-- 净缺口 -->
      <div class="p-4 rounded-lg" :class="deficitBgColor">
        <div class="flex items-center gap-2 mb-1">
          <svg class="w-4 h-4" :class="deficitIconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          <span class="text-xs" :class="deficitLabelColor">净缺口</span>
        </div>
        <div class="text-xl font-bold" :class="deficitValueColor">
          {{ deficitSign }}{{ Math.abs(netDeficit) }} kcal
        </div>
      </div>
    </div>

    <!-- 状态提示 -->
    <div class="mt-4 p-3 rounded-lg" :class="statusBgColor">
      <div class="flex items-center gap-2">
        <span class="text-lg">{{ statusIcon }}</span>
        <span class="text-sm font-medium" :class="statusTextColor">
          {{ statusMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DeficitStatus } from '@/types'

const props = defineProps<{
  budget: number
  intake: number
  exercise: number
  netDeficit: number
  tdee: number
  status: DeficitStatus
}>()

const circumference = 2 * Math.PI * 45 // 约 283

const progressPercentage = computed(() => {
  if (props.budget === 0) return 0
  return Math.round((props.intake / props.budget) * 100)
})

const budgetOffset = computed(() => {
  const percentage = Math.min(progressPercentage.value / 100, 1)
  return circumference * (1 - percentage)
})

const budgetRingColor = computed(() => {
  if (props.intake <= props.budget) {
    return '#10B981' // 绿色
  } else if (props.intake <= props.tdee) {
    return '#F59E0B' // 黄色
  } else {
    return '#EF4444' // 红色
  }
})

const statusColor = computed(() => {
  if (props.intake <= props.budget) {
    return 'text-health-600'
  } else if (props.intake <= props.tdee) {
    return 'text-amber-600'
  } else {
    return 'text-red-600'
  }
})

const intakeColor = computed(() => {
  if (props.intake <= props.budget) {
    return 'text-health-600'
  } else if (props.intake <= props.tdee) {
    return 'text-amber-600'
  } else {
    return 'text-red-600'
  }
})

const deficitSign = computed(() => {
  return props.netDeficit >= 0 ? '+' : '-'
})

const deficitBgColor = computed(() => {
  if (props.netDeficit >= 0) {
    return 'bg-health-50'
  } else {
    return 'bg-red-50'
  }
})

const deficitIconColor = computed(() => {
  if (props.netDeficit >= 0) {
    return 'text-health-600'
  } else {
    return 'text-red-600'
  }
})

const deficitLabelColor = computed(() => {
  if (props.netDeficit >= 0) {
    return 'text-health-600'
  } else {
    return 'text-red-600'
  }
})

const deficitValueColor = computed(() => {
  if (props.netDeficit >= 0) {
    return 'text-health-600'
  } else {
    return 'text-red-600'
  }
})

const statusIcon = computed(() => {
  switch (props.status) {
    case 'in_deficit': return '✅'
    case 'near_limit': return '⚠️'
    case 'over_budget': return '❌'
    default: return '❓'
  }
})

const statusMessage = computed(() => {
  switch (props.status) {
    case 'in_deficit': return '在缺口内，继续保持！'
    case 'near_limit': return '接近上限，注意控制'
    case 'over_budget': return '已超支，建议调整'
    default: return '未知状态'
  }
})

const statusBgColor = computed(() => {
  switch (props.status) {
    case 'in_deficit': return 'bg-health-50'
    case 'near_limit': return 'bg-amber-50'
    case 'over_budget': return 'bg-red-50'
    default: return 'bg-gray-50'
  }
})

const statusTextColor = computed(() => {
  switch (props.status) {
    case 'in_deficit': return 'text-health-700'
    case 'near_limit': return 'text-amber-700'
    case 'over_budget': return 'text-red-700'
    default: return 'text-gray-700'
  }
})
</script>