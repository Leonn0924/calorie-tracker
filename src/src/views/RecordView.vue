<template>
  <div class="space-y-6">
    <!-- AI 智能估算（V1 版本隐藏） -->
    <!-- <AIInput @confirm="handleAIConfirm" /> -->

    <!-- 快捷记录 -->
    <QuickRecord
      @add="handleQuickAdd"
      @addCustom="showCustomFoodDialog = true"
    />

    <!-- 快速 Kcal 输入 -->
    <QuickKcalInput />

    <!-- 热量计算器 -->
    <CalorieCalculator />

    <!-- 三餐分区 -->
    <MealSections
      :records="dailyStats.meals"
      :budget="dailyStats.budget"
      :tdee="settings.tdee"
      @edit="handleEditRecord"
      @delete="handleDeleteRecord"
    />

    <!-- 运动消耗 -->
    <ExercisePanel />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MealType, FoodItem, MealRecord } from '@/types'
import { useDailyStats } from '@/composables/useDailyStats'
import { useSettings } from '@/composables/useSettings'
// AI 智能估算（V1 版本隐藏）
// import AIInput from '@/components/AIInput.vue'
import QuickRecord from '@/components/QuickRecord.vue'
import QuickKcalInput from '@/components/QuickKcalInput.vue'
import CalorieCalculator from '@/components/CalorieCalculator.vue'
import MealSections from '@/components/MealSections.vue'
import ExercisePanel from '@/components/ExercisePanel.vue'

const { dailyStats, addMeal, removeMeal } = useDailyStats()
const { settings } = useSettings()

const showCustomFoodDialog = ref(false)

// AI 智能估算确认（V1 版本隐藏）
// function handleAIConfirm(items: AIEstimateItem[], mealType: string) {
//   items.forEach(item => {
//     addMeal({
//       date: new Date().toISOString().split('T')[0],
//       mealType: mealType as MealType,
//       foodId: 'ai-' + Date.now() + Math.random(),
//       foodName: item.foodName,
//       caloriesPer100g: Math.round(item.calories / item.grams * 100),
//       grams: item.grams,
//       source: 'ai',
//       confidence: item.confidence,
//       rawInput: item.note,
//     })
//   })
// }

function handleQuickAdd(food: FoodItem, grams: number, mealType: MealType) {
  addMeal({
    date: new Date().toISOString().split('T')[0],
    mealType,
    foodId: food.id,
    foodName: food.name,
    caloriesPer100g: food.caloriesPer100g,
    grams,
    source: 'manual',
  })
}

function handleEditRecord(record: MealRecord) {
  // TODO: 实现编辑功能
  console.log('Edit record:', record)
}

function handleDeleteRecord(id: string) {
  if (confirm('确定要删除这条记录吗？')) {
    removeMeal(id)
  }
}
</script>