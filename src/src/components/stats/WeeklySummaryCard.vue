<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">{{ period === 'week' ? '本周汇总' : '本月汇总' }}</h3>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-500">{{ averageIntake }}</div>
        <div class="text-xs text-gray-500">平均摄入</div>
        <div class="text-xs text-gray-400">千卡/天</div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-blue-500">{{ averageExercise }}</div>
        <div class="text-xs text-gray-500">平均消耗</div>
        <div class="text-xs text-gray-400">千卡/天</div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold" :class="averageDeficit > 0 ? 'text-green-500' : 'text-red-500'">
          {{ averageDeficit > 0 ? '+' : '' }}{{ averageDeficit }}
        </div>
        <div class="text-xs text-gray-500">平均缺口</div>
        <div class="text-xs text-gray-400">千卡/天</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Period = 'week' | 'month'

defineProps<{
  period: Period
  averageIntake: number
  averageExercise: number
  averageDeficit: number
}>()
</script>
