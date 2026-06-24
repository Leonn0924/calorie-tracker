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
        <input
          v-model.number="kcalInput"
          type="number"
          min="1"
          max="10000"
          required
          class="w-full px-4 py-3 text-2xl font-bold text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="0"
        />
      </div>

      <!-- 餐别选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">餐别</label>
        <div class="grid grid-cols-4 gap-2">
          <button
            type="button"
            v-for="meal in mealOptions"
            :key="meal.value"
            @click="selectedMealType = meal.value"
            :class="selectedMealType === meal.value ? 'bg-health-green text-white border-health-green' : 'bg-white text-gray-700 border-gray-300 hover:border-health-green'"
            class="py-2 px-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-1.5"
          >
            <Icons :name="meal.icon" size="sm" class="text-current" />
            <span class="text-sm font-medium">{{ meal.label }}</span>
          </button>
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
        class="w-full py-3 bg-health-green text-white font-medium rounded-lg hover:bg-health-green-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        添加记录
      </button>
    </form>

    <!-- 成功提示 -->
    <div v-if="showSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
      <Icons name="check-circle" size="md" class="text-green-600" />
      <span class="text-sm text-green-700">已记录 {{ lastRecord }} kcal（{{ selectedMealType }}）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDailyStats } from '@/composables/useDailyStats'
import { getToday, inferMealType } from '@/utils/date'
import Icons from '@/components/icons/Icons.vue'

const { addMeal } = useDailyStats()

const kcalInput = ref<number>(0)
const note = ref('')
const showSuccess = ref(false)
const lastRecord = ref(0)

// 餐别选项（使用 Heroicons 图标名称）
const mealOptions = [
  { value: '早餐' as const, label: '早餐', icon: 'sun' },
  { value: '午餐' as const, label: '午餐', icon: 'cloud-sun' },
  { value: '晚餐' as const, label: '晚餐', icon: 'moon' },
  { value: '加餐' as const, label: '加餐', icon: 'sparkles' },
]

// 默认根据当前时间自动判断餐别
const selectedMealType = ref(inferMealType(new Date()))

function handleSubmit() {
  if (!kcalInput.value || kcalInput.value <= 0) return

  // 添加饮食记录
  addMeal({
    date: getToday(),
    mealType: selectedMealType.value,
    foodId: 'manual-kcal',
    foodName: note.value ? `手动记录 (${note.value})` : '手动记录',
    caloriesPer100g: kcalInput.value,
    grams: 1,
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
