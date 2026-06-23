<template>
  <div class="mx-4 mt-4 p-5 rounded-2xl bg-gradient-to-br from-health-green/10 via-white to-health-cyan/10 border border-health-green/20 shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm font-semibold text-gray-700">今日概览</span>
      <span class="text-xs text-gray-400">6月23日</span>
    </div>

    <!-- Progress Ring -->
    <div class="flex items-center justify-center mb-4">
      <div class="relative w-32 h-32">
        <svg class="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" stroke-width="2.5"/>
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10B981" stroke-width="2.5"
            :stroke-dasharray="97.4"
            :stroke-dashoffset="97.4 - (97.4 * percentage)"
            stroke-linecap="round"/>
        </svg>
        <div class="absolute inset-0 flex items-center justify-center flex-col">
          <span class="text-2xl font-bold text-gray-900">{{ Math.round(percentage * 100) }}%</span>
          <span class="text-[10px] text-gray-400">已用预算</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="space-y-2 text-sm">
      <div class="flex justify-between items-center">
        <span class="text-gray-500">饮食预算</span>
        <span class="font-semibold">{{ stats.budget }} kcal</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-gray-500">已摄入</span>
        <span class="font-semibold text-health-green">{{ stats.intake }} kcal</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-gray-500">运动消耗</span>
        <span class="font-semibold text-health-blue">+{{ stats.exercise }} kcal</span>
      </div>
      <div class="flex justify-between items-center pt-2 border-t border-gray-100">
        <span class="text-gray-600 font-medium">净缺口</span>
        <span class="font-bold text-health-green text-base">+{{ stats.netDeficit }} kcal</span>
      </div>
    </div>

    <!-- Status -->
    <div class="mt-4 pt-3 border-t border-health-green/20 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-health-green animate-pulse"></span>
        <span class="text-sm font-semibold text-health-green-dark">✅ 在缺口内</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRaw } from 'vue'
import type { DailyStats } from '@/types'

const props = defineProps<{
  stats: DailyStats
}>()

const percentage = computed(() => {
  return props.stats.intake / props.stats.budget
})
</script>