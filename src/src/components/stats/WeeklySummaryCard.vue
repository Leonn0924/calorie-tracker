<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">本周汇总</h3>

    <div class="grid grid-cols-3 gap-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-500">{{ weeklyAverageIntake }}</div>
        <div class="text-xs text-gray-500">平均摄入</div>
        <div class="text-xs text-gray-400">千卡/天</div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-blue-500">{{ weeklyAverageExercise }}</div>
        <div class="text-xs text-gray-500">平均消耗</div>
        <div class="text-xs text-gray-400">千卡/天</div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold" :class="weeklyAverageDeficit > 0 ? 'text-green-500' : 'text-red-500'">
          {{ weeklyAverageDeficit > 0 ? '+' : '' }}{{ weeklyAverageDeficit }}
        </div>
        <div class="text-xs text-gray-500">平均缺口</div>
        <div class="text-xs text-gray-400">千卡/天</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weeklyAverageIntake: number
  weeklyAverageExercise: number
  weeklyAverageDeficit: number
}>()
</script>
