<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
      热量计算器
    </h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 食物名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          食物名称 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="foodName"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="例如：鸡胸肉"
        />
      </div>

      <!-- 每 100g 热量 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          每 100g 热量 (kcal) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="caloriesPer100g"
          type="number"
          min="0"
          max="10000"
          step="0.1"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="例如：133"
        />
        <p class="text-xs text-gray-500 mt-1">查看食物包装上的营养表</p>
      </div>

      <!-- 克数 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          食用量 (g) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="grams"
          type="number"
          min="1"
          max="10000"
          step="1"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="例如：150"
        />
      </div>

      <!-- 计算结果 -->
      <div class="p-4 bg-gradient-to-br from-health-50 to-cyan-50 rounded-lg border border-health-200">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700">总热量</span>
          <div class="text-right">
            <div class="text-3xl font-bold text-health-600">
              {{ calculatedCalories }}
              <span class="text-base font-normal text-gray-500">kcal</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ caloriesPer100g }} kcal/100g × {{ grams }}g
            </div>
          </div>
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

      <!-- 提交按钮 -->
      <button
        type="submit"
        :disabled="!foodName || !caloriesPer100g || !grams"
        class="w-full py-3 bg-health-500 text-white font-medium rounded-lg hover:bg-health-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        添加到记录
      </button>
    </form>

    <!-- 成功提示 -->
    <div v-if="showSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
      <span class="text-green-600">✅</span>
      <span class="text-sm text-green-700">
        已记录 {{ foodName }} {{ grams }}g（{{ calculatedCalories }} kcal）
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDailyStats } from '@/composables/useDailyStats'
import { getToday, inferMealType } from '@/utils/date'
import { calculateCalories } from '@/utils/calculator'

const { addMeal } = useDailyStats()

const foodName = ref('')
const caloriesPer100g = ref<number>(0)
const grams = ref<number>(0)
const showSuccess = ref(false)

// 根据当前时间自动判断餐别
const mealType = computed(() => {
  return inferMealType(new Date())
})

const mealIcon = computed(() => {
  const icons: Record<string, string> = {
    '早餐': '🌅',
    '午餐': '☀️',
    '晚餐': '🌙',
    '加餐': '🍪',
  }
  return icons[mealType.value] || '🍽️'
})

// 实时计算总热量
const calculatedCalories = computed(() => {
  if (!caloriesPer100g.value || !grams.value) return 0
  return Math.round(calculateCalories(caloriesPer100g.value, grams.value))
})

function handleSubmit() {
  if (!foodName.value || !caloriesPer100g.value || !grams.value) return

  // 添加饮食记录
  addMeal({
    date: getToday(),
    mealType: mealType.value,
    foodId: 'calculator-' + Date.now(),
    foodName: foodName.value,
    caloriesPer100g: caloriesPer100g.value,
    grams: grams.value,
    calories: calculatedCalories.value,
    source: 'manual',
  })

  // 显示成功提示
  showSuccess.value = true

  // 3 秒后隐藏并重置表单
  setTimeout(() => {
    showSuccess.value = false
    foodName.value = ''
    caloriesPer100g.value = 0
    grams.value = 0
  }, 3000)
}
</script>
