<template>
  <div class="space-y-6">
    <!-- 今日概览 -->
    <TodaySummary
      :budget="dailyStats.budget"
      :intake="dailyStats.intake"
      :exercise="dailyStats.exercise"
      :netDeficit="dailyStats.netDeficit"
      :tdee="settings.tdee"
      :status="dailyStats.status"
    />

    <!-- AI 智能估算 -->
    <AIInput @confirm="handleAIConfirm" />

    <!-- 快捷记录 -->
    <QuickRecord
      @add="handleQuickAdd"
      @addCustom="showCustomFoodDialog = true"
    />

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
import type { AIEstimateItem, MealType, FoodItem, MealRecord } from '@/types'
import { useDailyStats } from '@/composables/useDailyStats'
import { useSettings } from '@/composables/useSettings'
import TodaySummary from '@/components/TodaySummary.vue'
import AIInput from '@/components/AIInput.vue'
import QuickRecord from '@/components/QuickRecord.vue'
import MealSections from '@/components/MealSections.vue'
import ExercisePanel from '@/components/ExercisePanel.vue'

const { dailyStats, addMeal, removeMeal } = useDailyStats()
const { settings } = useSettings()

const showCustomFoodDialog = ref(false)

function handleAIConfirm(items: AIEstimateItem[], mealType: string) {
  // 将 AI 估算结果添加到记录
  items.forEach(item => {
    // TODO: 需要创建 FoodItem 或从食物库查找
    addMeal({
      date: new Date().toISOString().split('T')[0],
      mealType: mealType as MealType,
      foodId: 'ai-' + Date.now() + Math.random(),
      foodName: item.foodName,
      caloriesPer100g: Math.round(item.calories / item.grams * 100),
      grams: item.grams,
      source: 'ai',
      confidence: item.confidence,
      rawInput: item.note,
    })
  })
}

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