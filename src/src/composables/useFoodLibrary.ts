import { ref, computed } from 'vue'
import type { FoodItem, FoodCategory } from '@/types'
import { storage } from '@/utils/storage'
import { builtinFoods } from '@/data/foods'

const CUSTOM_FOODS_KEY = 'custom-foods'

export function useFoodLibrary() {
  // 自定义食物列表
  const customFoods = ref<FoodItem[]>(
    storage.get<FoodItem[]>(CUSTOM_FOODS_KEY) || []
  )

  // 所有食物（内置 + 自定义）
  const allFoods = computed<FoodItem[]>(() => {
    // 自定义食物优先
    return [...customFoods.value, ...builtinFoods]
  })

  // 所有分类
  const categories = computed<FoodCategory[]>(() => {
    const categorySet = new Set<FoodCategory>()
    allFoods.value.forEach(food => {
      categorySet.add(food.category)
    })
    return Array.from(categorySet).sort()
  })

  // 搜索食物
  function searchFoods(query: string): FoodItem[] {
    if (!query.trim()) return allFoods.value

    const lowerQuery = query.toLowerCase()
    return allFoods.value.filter(food =>
      food.name.toLowerCase().includes(lowerQuery) ||
      food.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery))
    )
  }

  // 按分类筛选
  function filterByCategory(category: FoodCategory | null): FoodItem[] {
    if (!category) return allFoods.value
    return allFoods.value.filter(food => food.category === category)
  }

  // 添加自定义食物
  function addCustomFood(food: Omit<FoodItem, 'id' | 'createdAt' | 'isCustom'>): FoodItem {
    const newFood: FoodItem = {
      ...food,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    }

    customFoods.value.push(newFood)
    storage.set(CUSTOM_FOODS_KEY, customFoods.value)

    return newFood
  }

  // 删除自定义食物
  function removeCustomFood(id: string): boolean {
    const index = customFoods.value.findIndex(food => food.id === id)
    if (index === -1) return false

    customFoods.value.splice(index, 1)
    storage.set(CUSTOM_FOODS_KEY, customFoods.value)

    return true
  }

  // 根据 ID 获取食物
  function getFoodById(id: string): FoodItem | undefined {
    return allFoods.value.find(food => food.id === id)
  }

  return {
    allFoods,
    customFoods,
    categories,
    searchFoods,
    filterByCategory,
    addCustomFood,
    removeCustomFood,
    getFoodById,
  }
}
