<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">食物库</h1>
      <p class="text-gray-500 mt-1">浏览和搜索食物营养信息，支持自定义添加</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <!-- 搜索框 -->
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索食物名称..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
        />
        <svg
          class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <!-- 分类标签 -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categoryList"
          :key="cat.id"
          @click="selectedCategory = cat.value"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border-2',
            selectedCategory === cat.value
              ? 'bg-health-green text-white border-health-green'
              : 'bg-white text-gray-600 border-gray-300 hover:border-health-green'
          ]"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- 食物列表 -->
    <div v-if="filteredFoods.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="food in filteredFoods"
        :key="food.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="openFoodDetail(food)"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 flex items-center gap-2">
              {{ food.name }}
              <span
                v-if="food.isCustom"
                class="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded"
              >
                自定义
              </span>
            </h3>
            <p class="text-sm text-gray-500 mt-1">{{ food.category }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-health-500">{{ food.caloriesPer100g }}</p>
            <p class="text-xs text-gray-500">千卡/100{{ food.unit }}</p>
          </div>
        </div>

        <!-- 营养信息 -->
        <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
          <div>
            <p class="text-xs text-gray-500">蛋白质</p>
            <p class="text-sm font-medium text-gray-700">
              {{ food.protein || '-' }}g
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">碳水</p>
            <p class="text-sm font-medium text-gray-700">
              {{ food.carbs || '-' }}g
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">脂肪</p>
            <p class="text-sm font-medium text-gray-700">
              {{ food.fat || '-' }}g
            </p>
          </div>
        </div>

        <!-- 常用份量 -->
        <div v-if="food.commonPortion" class="mt-3 text-sm text-gray-600">
          常用份量：{{ food.commonPortion }}{{ food.unit }}
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12">
      <svg
        class="w-16 h-16 text-gray-300 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-gray-500">未找到匹配的食物</p>
    </div>

    <!-- 添加自定义食物按钮 -->
    <div class="fixed bottom-20 right-6 md:bottom-6 md:right-6">
      <button
        @click="showAddFoodDialog = true"
        class="w-14 h-14 bg-health-500 text-white rounded-full shadow-lg hover:bg-health-600 transition-colors flex items-center justify-center"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>

    <!-- 食物详情弹窗 -->
    <div
      v-if="selectedFood"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="selectedFood = null"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ selectedFood.name }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ selectedFood.category }}</p>
          </div>
          <button
            @click="selectedFood = null"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- 热量信息 -->
        <div class="bg-health-50 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">热量</span>
            <span class="text-3xl font-bold text-health-500">
              {{ selectedFood.caloriesPer100g }}
              <span class="text-sm font-normal">千卡/100{{ selectedFood.unit }}</span>
            </span>
          </div>
        </div>

        <!-- 营养成分 -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="bg-red-50 rounded-lg p-3 text-center">
            <p class="text-xs text-red-600 mb-1">蛋白质</p>
            <p class="text-xl font-bold text-red-700">
              {{ selectedFood.protein || '-' }}g
            </p>
          </div>
          <div class="bg-yellow-50 rounded-lg p-3 text-center">
            <p class="text-xs text-yellow-600 mb-1">碳水</p>
            <p class="text-xl font-bold text-yellow-700">
              {{ selectedFood.carbs || '-' }}g
            </p>
          </div>
          <div class="bg-blue-50 rounded-lg p-3 text-center">
            <p class="text-xs text-blue-600 mb-1">脂肪</p>
            <p class="text-xl font-bold text-blue-700">
              {{ selectedFood.fat || '-' }}g
            </p>
          </div>
        </div>

        <!-- 常用份量 -->
        <div v-if="selectedFood.commonPortion" class="bg-gray-50 rounded-lg p-4 mb-4">
          <p class="text-sm text-gray-600">
            常用份量：<span class="font-semibold text-gray-800">{{ selectedFood.commonPortion }}{{ selectedFood.unit }}</span>
          </p>
        </div>

        <!-- 别名 -->
        <div v-if="selectedFood.aliases && selectedFood.aliases.length > 0" class="mb-4">
          <p class="text-sm text-gray-600 mb-2">别名：</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(alias, index) in selectedFood.aliases"
              :key="index"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {{ alias }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3">
          <button
            @click="useInQuickRecord(selectedFood)"
            class="flex-1 bg-health-500 text-white py-2 rounded-lg hover:bg-health-600 transition-colors"
          >
            用于记录
          </button>
          <button
            v-if="selectedFood.isCustom"
            @click="deleteCustomFood(selectedFood.id)"
            class="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 添加自定义食物弹窗 -->
    <div
      v-if="showAddFoodDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showAddFoodDialog = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">添加自定义食物</h2>
          <button
            @click="showAddFoodDialog = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="addCustomFoodSubmit" class="space-y-4">
          <!-- 食物名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              食物名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="newFoodForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              placeholder="例如：全麦面包"
            />
          </div>

          <!-- 分类 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              分类 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="newFoodForm.category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            >
              <option value="">请选择分类</option>
              <option v-for="cat in allCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <!-- 热量和单位 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                热量 <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="newFoodForm.caloriesPer100g"
                type="number"
                required
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
                placeholder="千卡"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                单位 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="newFoodForm.unit"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              >
                <option value="g">克 (g)</option>
                <option value="ml">毫升 (ml)</option>
              </select>
            </div>
          </div>

          <!-- 营养成分 -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                蛋白质 (g)
              </label>
              <input
                v-model.number="newFoodForm.protein"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                碳水 (g)
              </label>
              <input
                v-model.number="newFoodForm.carbs"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                脂肪 (g)
              </label>
              <input
                v-model.number="newFoodForm.fat"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              />
            </div>
          </div>

          <!-- 常用份量 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              常用份量
            </label>
            <input
              v-model.number="newFoodForm.commonPortion"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              :placeholder="`常用食用量（${newFoodForm.unit}）`"
            />
          </div>

          <!-- 别名 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              别名（用逗号分隔）
            </label>
            <input
              v-model="newFoodForm.aliasesText"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              placeholder="例如：全麦吐司, 全麦馒头"
            />
          </div>

          <!-- 提交按钮 -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showAddFoodDialog = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 bg-health-500 text-white py-2 rounded-lg hover:bg-health-600 transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FoodItem, FoodCategory } from '@/types'
import { useFoodLibrary } from '@/composables/useFoodLibrary'

const {
  allFoods,
  categories,
  searchFoods,
  addCustomFood,
  removeCustomFood,
} = useFoodLibrary()

// 搜索和筛选状态
const searchQuery = ref('')
const selectedCategory = ref<FoodCategory | null>(null)

// 弹窗状态
const selectedFood = ref<FoodItem | null>(null)
const showAddFoodDialog = ref(false)

// 分类列表
const categoryList = computed(() => {
  const list = [
    { id: 'all', value: null, label: '全部' },
    ...categories.value.map(cat => ({ id: cat, value: cat, label: cat }))
  ]
  return list
})

// 所有分类（用于表单选择）
const allCategories = [
  '主食', '肉类', '蛋奶', '蔬菜', '水果', '饮品', '零食', '豆类', '坚果', '调味品', '其他'
]

// 筛选后的食物
const filteredFoods = computed(() => {
  let foods = allFoods.value

  // 按搜索词筛选
  if (searchQuery.value.trim()) {
    foods = searchFoods(searchQuery.value)
  }

  // 按分类筛选
  if (selectedCategory.value) {
    foods = foods.filter(food => food.category === selectedCategory.value)
  }

  return foods
})

// 打开食物详情
function openFoodDetail(food: FoodItem) {
  selectedFood.value = food
}

// 用于快捷记录
function useInQuickRecord(food: FoodItem) {
  // TODO: 实现跳转到记录页面并预填食物
  console.log('用于记录:', food)
  selectedFood.value = null
}

// 删除自定义食物
function deleteCustomFood(id: string) {
  if (confirm('确定要删除这个自定义食物吗？')) {
    removeCustomFood(id)
    selectedFood.value = null
  }
}

// 新增食物表单
const newFoodForm = ref({
  name: '',
  category: '' as FoodCategory | '',
  caloriesPer100g: 0,
  unit: 'g' as 'g' | 'ml',
  protein: undefined as number | undefined,
  carbs: undefined as number | undefined,
  fat: undefined as number | undefined,
  commonPortion: undefined as number | undefined,
  aliasesText: '',
})

// 提交新增食物
function addCustomFoodSubmit() {
  if (!newFoodForm.value.name || !newFoodForm.value.category || !newFoodForm.value.caloriesPer100g) {
    alert('请填写必填项')
    return
  }

  // 处理别名
  const aliases = newFoodForm.value.aliasesText
    .split(/[,，]/)
    .map(a => a.trim())
    .filter(a => a.length > 0)

  // 添加食物
  addCustomFood({
    name: newFoodForm.value.name,
    category: newFoodForm.value.category as FoodCategory,
    caloriesPer100g: newFoodForm.value.caloriesPer100g,
    unit: newFoodForm.value.unit,
    protein: newFoodForm.value.protein,
    carbs: newFoodForm.value.carbs,
    fat: newFoodForm.value.fat,
    commonPortion: newFoodForm.value.commonPortion,
    aliases: aliases.length > 0 ? aliases : undefined,
  })

  // 重置表单并关闭弹窗
  newFoodForm.value = {
    name: '',
    category: '',
    caloriesPer100g: 0,
    unit: 'g',
    protein: undefined,
    carbs: undefined,
    fat: undefined,
    commonPortion: undefined,
    aliasesText: '',
  }
  showAddFoodDialog.value = false
}
</script>
