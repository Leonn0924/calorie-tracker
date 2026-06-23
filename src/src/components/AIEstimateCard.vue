<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">AI 估算结果</h3>
      <div class="flex items-center gap-2">
        <span
          v-if="result.confidence"
          :class="confidenceClass"
          class="px-3 py-1 rounded-full text-sm font-medium"
        >
          {{ confidenceLabel }}
        </span>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="(item, index) in result.items"
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-800">{{ item.foodName }}</span>
            <span
              v-if="item.confidence === 'low'"
              class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded"
            >
              低置信度
            </span>
          </div>
          <div class="text-sm text-gray-500 mt-1">
            {{ item.grams }}g · {{ item.calories }} kcal
          </div>
          <div v-if="item.note" class="text-xs text-gray-400 mt-1">
            {{ item.note }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="$emit('edit', index)"
            class="text-sm text-health-600 hover:text-health-700"
          >
            编辑
          </button>
          <button
            @click="$emit('remove', index)"
            class="text-sm text-red-600 hover:text-red-700"
          >
            移除
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <span class="text-gray-600">餐别</span>
        <select
          :value="result.mealType"
          @change="$emit('update:mealType', ($event.target as HTMLSelectElement).value)"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="早餐">早餐</option>
          <option value="午餐">午餐</option>
          <option value="晚餐">晚餐</option>
          <option value="加餐">加餐</option>
        </select>
      </div>

      <div class="flex items-center justify-between text-lg font-semibold">
        <span class="text-gray-700">总计</span>
        <span class="text-health-600">{{ result.totalCalories }} kcal</span>
      </div>
    </div>

    <div class="mt-4 flex gap-3">
      <button
        @click="$emit('confirm')"
        class="flex-1 bg-health-600 text-white py-2 rounded-lg hover:bg-health-700 transition-colors"
      >
        确认记录
      </button>
      <button
        @click="$emit('retry')"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        重新估算
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EstimateResult, Confidence } from '@/types'

const props = defineProps<{
  result: EstimateResult
}>()

defineEmits<{
  close: []
  edit: [index: number]
  remove: [index: number]
  confirm: []
  retry: []
  'update:mealType': [mealType: string]
}>()

const hasLowConfidence = computed(() =>
  props.result.items.some(item => item.confidence === 'low')
)

const overallConfidence = computed<Confidence>(() => {
  if (hasLowConfidence.value) return 'low'
  const allHigh = props.result.items.every(item => item.confidence === 'high')
  return allHigh ? 'high' : 'medium'
})

const confidenceClass = computed(() => {
  const classes = {
    high: 'bg-green-50 text-green-700',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-red-50 text-red-700',
  }
  return classes[overallConfidence.value]
})

const confidenceLabel = computed(() => {
  const labels = {
    high: '高置信度',
    medium: '中置信度',
    low: '低置信度',
  }
  return labels[overallConfidence.value]
})
</script>