<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
        AI 智能估算
      </h3>
      <div class="flex items-center gap-2">
        <select
          :value="mode"
          @change="handleModeChange(($event.target as HTMLSelectElement).value as EstimateMode)"
          class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-health-600"
        >
          <option value="rule">规则引擎</option>
          <option value="llm">大模型</option>
          <option value="hybrid">混合模式</option>
        </select>
      </div>
    </div>

    <div class="space-y-4">
      <!-- 输入区 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          描述你吃了什么
        </label>
        <textarea
          v-model="inputText"
          placeholder="例如：早餐吃了一碗米饭、一个鸡蛋和一杯牛奶"
          rows="3"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-600 focus:border-transparent resize-none"
          :disabled="loading"
        ></textarea>
      </div>

      <!-- 估算按钮 -->
      <button
        @click="handleEstimate"
        :disabled="loading || !inputText.trim()"
        class="w-full bg-health-600 text-white py-3 rounded-lg font-medium hover:bg-health-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="loading">正在分析...</span>
        <span v-else>🧠 智能估算</span>
      </button>

      <!-- 错误提示 -->
      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div class="flex-1">
            <p class="text-sm text-red-800">{{ error }}</p>
            <button
              @click="clearError"
              class="text-sm text-red-600 hover:text-red-700 mt-1"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      <!-- 估算结果 -->
      <div v-if="result">
        <AIEstimateCard
          :result="result"
          @confirm="handleConfirm"
          @retry="handleRetry"
          @edit="handleEdit"
          @remove="handleRemove"
          @update:mealType="handleUpdateMealType"
        />
      </div>

      <!-- 提示 -->
      <div v-if="!result && !loading" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="flex-1">
            <p class="text-sm text-blue-800 font-medium">使用提示</p>
            <ul class="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
              <li>描述越详细，估算越准确</li>
              <li>可以包含多种食物，用逗号或"和"分隔</li>
              <li>估算结果可以手动调整后确认</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EstimateMode, AIEstimateItem } from '@/types'
import { useAIEstimation } from '@/composables/useAIEstimation'
import AIEstimateCard from './AIEstimateCard.vue'

const emit = defineEmits<{
  confirm: [items: AIEstimateItem[], mealType: string]
}>()

const {
  loading,
  error,
  result,
  mode,
  estimate,
  switchMode,
  clearError,
  clearResult,
} = useAIEstimation()

const inputText = ref('')

function handleModeChange(newMode: EstimateMode) {
  switchMode(newMode)
}

async function handleEstimate() {
  if (!inputText.value.trim()) return
  await estimate(inputText.value)
}

function handleConfirm() {
  if (result.value) {
    emit('confirm', result.value.items, result.value.mealType)
    clearResult()
    inputText.value = ''
  }
}

function handleRetry() {
  if (inputText.value.trim()) {
    estimate(inputText.value)
  }
}

function handleEdit(index: number) {
  // TODO: 实现编辑功能
  console.log('Edit item at index:', index)
}

function handleRemove(index: number) {
  if (result.value) {
    result.value.items.splice(index, 1)
    result.value.totalCalories = result.value.items.reduce(
      (sum, item) => sum + item.calories,
      0
    )
  }
}

function handleUpdateMealType(mealType: string) {
  if (result.value) {
    result.value.mealType = mealType as any
  }
}
</script>