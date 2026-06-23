<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">今日缺口</h3>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <div class="text-sm text-gray-500 mb-1">预算</div>
        <div class="text-2xl font-bold text-gray-800">{{ gap.budget }}</div>
        <div class="text-xs text-gray-400">千卡</div>
      </div>

      <div>
        <div class="text-sm text-gray-500 mb-1">已摄入</div>
        <div class="text-2xl font-bold text-orange-500">{{ gap.intake }}</div>
        <div class="text-xs text-gray-400">千卡</div>
      </div>

      <div>
        <div class="text-sm text-gray-500 mb-1">运动消耗</div>
        <div class="text-2xl font-bold text-blue-500">+{{ gap.exercise }}</div>
        <div class="text-xs text-gray-400">千卡</div>
      </div>

      <div>
        <div class="text-sm text-gray-500 mb-1">净缺口</div>
        <div class="text-2xl font-bold" :class="deficitColor">
          {{ gap.netDeficit > 0 ? '+' : '' }}{{ gap.netDeficit }}
        </div>
        <div class="text-xs text-gray-400">千卡</div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500">状态</span>
        <span class="px-3 py-1 rounded-full text-sm font-medium" :class="statusBadgeClass">
          {{ statusText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DeficitStatus } from '@/types'

interface GapData {
  budget: number
  intake: number
  exercise: number
  netDeficit: number
  status: DeficitStatus
  remaining: number
}

const props = defineProps<{
  gap: GapData
}>()

const deficitColor = computed(() => {
  if (props.gap.netDeficit > 0) return 'text-green-500'
  if (props.gap.netDeficit === 0) return 'text-gray-500'
  return 'text-red-500'
})

const statusText = computed(() => {
  switch (props.gap.status) {
    case 'in_deficit':
      return '✅ 缺口达成'
    case 'near_limit':
      return '⚠️ 接近上限'
    case 'over_budget':
      return '❌ 已超支'
    default:
      return '未知'
  }
})

const statusBadgeClass = computed(() => {
  switch (props.gap.status) {
    case 'in_deficit':
      return 'bg-green-100 text-green-700'
    case 'near_limit':
      return 'bg-yellow-100 text-yellow-700'
    case 'over_budget':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
})
</script>
