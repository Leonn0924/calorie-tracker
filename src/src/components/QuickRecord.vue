<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      快捷记录
    </h3>

    <div class="space-y-4">
      <!-- 搜索框 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          搜索食物
        </label>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="输入食物名称..."
            class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-600 focus:border-transparent"
          />
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchQuery && searchResults.length > 0" class="space-y-2">
        <p class="text-sm text-gray-600 font-medium">搜索结果</p>
        <div class="max-h-64 overflow-y-auto space-y-2">
          <div
            v-for="food in searchResults"
            :key="food.id"
            @click="selectFood(food)"
            class="p-3 border border-gray-200 rounded-lg hover:border-health-600 hover:bg-health-50 cursor-pointer transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800">{{ food.name }}</p>
                <p class="text-xs text-gray-500">{{ food.category }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-health-600">
                  {{ food.caloriesPer100g }} kcal
                </p>
                <p class="text-xs text-gray-500">/100g</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div v-else-if="searchQuery && searchResults.length === 0" class="text-center py-8">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-sm text-gray-500">未找到匹配的食物</p>
        <button
          @click="$emit('addCustom')"
          class="text-sm text-health-600 hover:text-health-700 mt-1"
        >
          添加自定义食物
        </button>
      </div>

      <!-- 已选食物 -->
      <div v-if="selectedFood" class="p-4 bg-health-50 border border-health-200 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="font-medium text-gray-800">{{ selectedFood.name }}</p>
            <p class="text-xs text-gray-500">{{ selectedFood.category }}</p>
          </div>
          <button
            @click="clearSelection"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">
              克数 ({{ selectedFood.unit }})
            </label>
            <input
              v-model.number="grams"
              type="number"
              min="0"
              step="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-600"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">热量</label>
            <div class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-health-600 font-semibold">
              {{ calculatedCalories }} kcal
            </div>
          </div>
        </div>

        <div class="mt-3">
          <label class="block text-xs text-gray-600 mb-1">餐别</label>
          <select
            v-model="mealType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-600"
          >
            <option value="早餐">早餐</option>
            <option value="午餐">午餐</option>
            <option value="晚餐">晚餐</option>
            <option value="加餐">加餐</option>
          </select>
        </div>

        <button
          @click="addRecord"
          class="w-full mt-3 bg-health-600 text-white py-2 rounded-lg font-medium hover:bg-health-700 transition-colors"
        >
          添加记录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FoodItem, MealType } from '@/types'
import { searchFood } from '@/data/foods'
import { calculateCalories } from '@/utils/calculator'

const emit = defineEmits<{
  add: [food: FoodItem, grams: number, mealType: MealType]
  addCustom: []
}>()

const searchQuery = ref('')
const selectedFood = ref<FoodItem | null>(null)
const grams = ref(100)
const mealType = ref<MealType>('午餐')

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  return searchFood(searchQuery.value).slice(0, 10)
})

const calculatedCalories = computed(() => {
  if (!selectedFood.value) return 0
  return Math.round(calculateCalories(selectedFood.value.caloriesPer100g, grams.value))
})

function selectFood(food: FoodItem) {
  selectedFood.value = food
  grams.value = food.commonPortion || 100
  searchQuery.value = ''
}

function clearSelection() {
  selectedFood.value = null
  grams.value = 100
}

function addRecord() {
  if (selectedFood.value) {
    emit('add', selectedFood.value, grams.value, mealType.value)
    clearSelection()
  }
}

// 自动推断餐别
watch(mealType, () => {
  // 可以在这里添加自动推断逻辑
})
</script>