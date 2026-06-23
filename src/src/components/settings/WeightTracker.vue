<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">体重记录</h3>

    <!-- 添加体重表单 -->
    <form @submit.prevent="handleAddWeight" class="mb-6 space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <input
            v-model="newWeightDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
          <input
            v-model.number="newWeightValue"
            type="number"
            min="30"
            max="300"
            step="0.1"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            placeholder="70.5"
          />
        </div>
      </div>
      <button
        type="submit"
        class="w-full py-2 bg-health-500 text-white rounded-lg hover:bg-health-600 transition-colors"
      >
        添加记录
      </button>
    </form>

    <!-- 体重变化 -->
    <div v-if="weightChange" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="text-sm text-gray-600 mb-2">体重变化</div>
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <div class="text-2xl font-bold" :class="weightChange.absolute < 0 ? 'text-green-600' : 'text-red-600'">
            {{ weightChange.absolute > 0 ? '+' : '' }}{{ weightChange.absolute.toFixed(1) }}
            <span class="text-sm font-normal text-gray-500">kg</span>
          </div>
          <div class="text-xs text-gray-500">绝对变化</div>
        </div>
        <div class="flex-1">
          <div class="text-2xl font-bold" :class="weightChange.percentage < 0 ? 'text-green-600' : 'text-red-600'">
            {{ weightChange.percentage > 0 ? '+' : '' }}{{ weightChange.percentage.toFixed(1) }}
            <span class="text-sm font-normal text-gray-500">%</span>
          </div>
          <div class="text-xs text-gray-500">相对变化</div>
        </div>
      </div>
    </div>

    <!-- 体重历史列表 -->
    <div v-if="sortedWeights.length > 0">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-700">历史记录</h4>
        <button
          @click="handleClearAll"
          class="text-xs text-red-600 hover:text-red-700"
        >
          清空全部
        </button>
      </div>

      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="record in sortedWeights"
          :key="record.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div>
            <div class="text-sm font-medium text-gray-800">{{ formatDate(record.date) }}</div>
            <div class="text-xs text-gray-500">{{ record.weight }} kg</div>
          </div>
          <button
            @click="handleRemoveWeight(record.id)"
            class="text-gray-400 hover:text-red-500"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-400">
      <div class="text-sm">暂无体重记录</div>
      <div class="text-xs mt-1">添加第一条记录开始追踪体重变化</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWeight } from '@/composables/useWeight'
import { getToday, formatDate } from '@/utils/date'

const { sortedWeights, addWeight, removeWeight, getWeightChange, clearAllWeights } = useWeight()

const newWeightDate = ref(getToday())
const newWeightValue = ref<number>(70)

const weightChange = computed(() => getWeightChange())

function handleAddWeight() {
  if (newWeightValue.value && newWeightDate.value) {
    addWeight(newWeightValue.value, newWeightDate.value)
    newWeightValue.value = 70
    newWeightDate.value = getToday()
    alert('体重记录已添加')
  }
}

function handleRemoveWeight(id: string) {
  if (confirm('确定要删除这条记录吗？')) {
    removeWeight(id)
  }
}

function handleClearAll() {
  if (confirm('确定要清空所有体重记录吗？此操作不可恢复。')) {
    clearAllWeights()
  }
}
</script>
