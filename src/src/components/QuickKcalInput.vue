<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
      快速记录
    </h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- kcal 输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          热量 (kcal) <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            v-model.number="kcalInput"
            type="number"
            min="1"
            max="10000"
            required
            class="w-full px-4 py-3 text-2xl font-bold text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            placeholder="0"
          />
          <div class="absolute right-3 top-3 text-sm text-gray-500">kcal</div>
        </div>
      </div>

      <!-- 餐别显示 -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span class="text-sm text-gray-600">餐别</span>
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ mealIcon }}</span>
          <span class="font-medium text-gray-800">{{ mealType }}</span>
        </div>
      </div>

      <!-- 备注（可选） -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          备注 <span class="text-xs text-gray-400">（可选）</span>
        </label>
        <input
          v-model="note"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="例如：外卖盒饭、下午茶..."
        />
      </div>

      <!-- 提交按钮 -->
      <button
        type="submit"
        :disabled="!kcalInput || kcalInput <= 0"
        class="w-full py-3 bg-health-500 text-white font-medium rounded-lg hover:bg-health-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        添加记录
      </button>
    </form>

    <!-- 成功提示 -->
    <div v-if="showSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
      <span class="text-green-600">✅</span>
      <span class="text-sm text-green-700">已记录 {{ lastRecord }} kcal（{{ mealType }}）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDailyStats } from '@/composables/useDailyStats'
import { getToday, inferMealType } from '@/utils/date'

const { addMeal } = useDailyStats()

const kcalInput = ref<number>(0)
const note = ref('')
const showSuccess = ref(false)
const lastRecord = ref(0)

// 根据当前时间自动判断餐别
const mealType = computed(() => {
  return inferMealType(new Date())
})

const mealIcon = computed(() => {
  const icons: Record<string, string> = {
    '早餐': '🌅',
    '午餐': '️',
    '晚餐': '🌙',
    '加餐': '🍪',
  }
  return icons[mealType.value] || '🍽️'
})

function handleSubmit() {
  if (!kcalInput.value || kcalInput.value <= 0) return

  // 添加饮食记录（使用占位食物 ID）
  addMeal({
    date: getToday(),
    mealType: mealType.value,
    foodId: 'manual-kcal',
    foodName: note.value ? `手动记录 (${note.value})` : '手动记录',
    caloriesPer100g: kcalInput.value, // 这里用 kcal 值占位
    grams: 1, // 占位，实际不需要
    calories: kcalInput.value,
    source: 'manual',
  })

  // 显示成功提示
  lastRecord.value = kcalInput.value
  showSuccess.value = true
  kcalInput.value = 0
  note.value = ''

  // 3 秒后隐藏成功提示
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}
</script>
