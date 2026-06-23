<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">本周达成率</h3>

    <div class="flex items-center justify-center mb-4">
      <div class="relative w-32 h-32">
        <svg viewBox="0 0 100 100" class="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#E5E7EB"
            stroke-width="12"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            :stroke="ringColor"
            stroke-width="12"
            stroke-linecap="round"
            :stroke-dasharray="`${achievement.rate * 2.51} ${251 - achievement.rate * 2.51}`"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <div class="text-3xl font-bold" :class="ringColor">{{ achievement.rate }}%</div>
            <div class="text-xs text-gray-500">达成率</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-800">{{ achievement.inDeficitDays }}</div>
        <div class="text-xs text-gray-500">达标天数</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-800">{{ achievement.totalDays }}</div>
        <div class="text-xs text-gray-500">总天数</div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="text-center text-sm text-gray-600">
        <span v-if="achievement.rate >= 80" class="text-green-600 font-medium">🎉 表现优秀！继续保持</span>
        <span v-else-if="achievement.rate >= 60" class="text-yellow-600 font-medium">💪 还不错，继续加油</span>
        <span v-else class="text-red-600 font-medium">⚠️ 需要更多努力</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AchievementData {
  inDeficitDays: number
  totalDays: number
  rate: number
}

const props = defineProps<{
  achievement: AchievementData
}>()

const ringColor = computed(() => {
  if (props.achievement.rate >= 80) return 'text-green-500'
  if (props.achievement.rate >= 60) return 'text-yellow-500'
  return 'text-red-500'
})
</script>
