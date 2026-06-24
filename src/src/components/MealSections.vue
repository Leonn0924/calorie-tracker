<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      今日饮食记录
    </h3>

    <div class="space-y-6">
      <!-- 各个餐别 -->
      <div v-for="section in mealSections" :key="section.type">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-700 flex items-center gap-2">
            <Icons :name="section.icon" size="sm" class="text-gray-500" />
            {{ section.label }}
          </h4>
          <span class="text-sm font-semibold" :class="section.caloriesColor">
            {{ section.calories }} kcal
          </span>
        </div>

        <!-- 记录列表 -->
        <div v-if="section.records.length > 0" class="space-y-2">
          <div
            v-for="record in section.records"
            :key="record.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ record.foodName }}</p>
              <p class="text-xs text-gray-500">
                {{ record.grams }}{{ getUnit(record.foodId) }} · {{ record.calories }} kcal
                <span v-if="record.source === 'ai'" class="ml-1 text-blue-600">AI</span>
              </p>
            </div>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="$emit('edit', record)"
                class="text-gray-400 hover:text-health-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click="$emit('delete', record.id)"
                class="text-gray-400 hover:text-red-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-6 text-gray-400">
          <p class="text-sm">暂无记录</p>
        </div>
      </div>
    </div>

    <!-- 总计 -->
    <div class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-600">今日总计</span>
        <span class="text-lg font-bold" :class="totalCaloriesColor">
          {{ totalCalories }} kcal
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MealRecord, MealType } from '@/types'
import { getFoodById } from '@/data/foods'
import Icons from '@/components/icons/Icons.vue'

const props = defineProps<{
  records: MealRecord[]
  budget: number
  tdee: number
}>()

defineEmits<{
  edit: [record: MealRecord]
  delete: [id: string]
}>()

const mealTypes: { type: MealType; label: string; icon: string }[] = [
  { type: '早餐', label: '早餐', icon: 'sun' },
  { type: '午餐', label: '午餐', icon: 'cloud-sun' },
  { type: '晚餐', label: '晚餐', icon: 'moon' },
  { type: '加餐', label: '加餐', icon: 'sparkles' },
]

const mealSections = computed(() => {
  return mealTypes.map(({ type, label, icon }) => {
    const records = props.records.filter(r => r.mealType === type)
    const calories = records.reduce((sum, r) => sum + r.calories, 0)

    return {
      type,
      label,
      icon,
      records,
      calories,
      caloriesColor: getCaloriesColor(calories),
    }
  })
})

const totalCalories = computed(() => {
  return props.records.reduce((sum, r) => sum + r.calories, 0)
})

const totalCaloriesColor = computed(() => {
  return getCaloriesColor(totalCalories.value)
})

function getCaloriesColor(calories: number): string {
  if (calories <= props.budget) {
    return 'text-health-600' // 绿色
  } else if (calories <= props.tdee) {
    return 'text-amber-600' // 黄色
  } else {
    return 'text-red-600' // 红色
  }
}

function getUnit(foodId: string): string {
  const food = getFoodById(foodId)
  return food?.unit || 'g'
}
</script>