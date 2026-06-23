import type { AIEstimateItem, EstimateResult, MealType } from '@/types'
import { searchFood } from '@/data/foods'

/**
 * 标准份量表（克）- 作为后备
 */
const STANDARD_PORTIONS: Record<string, number> = {
  '米饭': 400,
  '面条': 400,
  '馒头': 100,
  '包子': 100,
  '鸡蛋': 60,
  '牛奶': 250,
  '可乐': 330,
  '啤酒': 330,
  '苹果': 200,
  '香蕉': 120,
  '橙子': 200,
  '面包': 60,
  '吐司': 60,
  '鸡胸肉': 150,
  '牛肉': 150,
  '猪肉': 150,
  '鱼肉': 150,
  '虾': 150,
  '蔬菜': 200,
  '水果': 200,
  '汤': 300,
  '粥': 300,
}

/**
 * 拆分关键词
 */
const SPLIT_KEYWORDS = ['，', '、', '和', '还', '加', '以及', '，', ',']

/**
 * 模糊量词（按标准份量的 50% 估算）
 */
const VAGUE_QUANTIFIERS = ['一些', '一点', '少量', '少许', '几口', '一点']

/**
 * 餐别关键词
 */
const MEAL_KEYWORDS: Record<string, MealType> = {
  '早': '早餐',
  '早餐': '早餐',
  '中午': '午餐',
  '午餐': '午餐',
  '午': '午餐',
  '晚上': '晚餐',
  '晚餐': '晚餐',
  '晚': '晚餐',
  '宵夜': '加餐',
  '加餐': '加餐',
  '零食': '加餐',
}

/**
 * 规则引擎：关键词拆分 + 标准份量表
 */
export function ruleEngine(input: string): EstimateResult {
  // 1. 推断餐别
  const mealType = inferMealType(input)

  // 2. 拆分食物条目
  const items = splitFoodItems(input)

  // 3. 匹配食物库并估算
  const estimatedItems = items.map(item => estimateFoodItem(item))

  // 4. 计算总热量
  const totalCalories = estimatedItems.reduce((sum, item) => sum + item.calories, 0)

  return {
    mealType,
    items: estimatedItems,
    totalCalories,
  }
}

/**
 * 推断餐别
 */
function inferMealType(input: string): MealType {
  for (const [keyword, mealType] of Object.entries(MEAL_KEYWORDS)) {
    if (input.includes(keyword)) {
      return mealType
    }
  }

  // 默认根据当前时间推断
  const hour = new Date().getHours()
  if (hour >= 0 && hour <= 10) return '早餐'
  if (hour >= 11 && hour <= 13) return '午餐'
  if (hour >= 14 && hour <= 17) return '晚餐'
  return '加餐'
}

/**
 * 拆分食物条目
 */
function splitFoodItems(input: string): string[] {
  // 移除餐别关键词
  let cleaned = input
  for (const keyword of Object.keys(MEAL_KEYWORDS)) {
    cleaned = cleaned.replace(new RegExp(keyword, 'g'), '')
  }

  // 按分隔符拆分
  let items = [cleaned]
  for (const separator of SPLIT_KEYWORDS) {
    items = items.flatMap(item => item.split(separator))
  }

  // 清理空白并过滤空字符串
  return items
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

/**
 * 估算单个食物条目
 */
function estimateFoodItem(item: string): AIEstimateItem {
  // 检查是否包含模糊量词
  const isVague = VAGUE_QUANTIFIERS.some(q => item.includes(q))

  // 移除量词，提取食物名称
  let foodName = item
  for (const q of VAGUE_QUANTIFIERS) {
    foodName = foodName.replace(q, '').trim()
  }

  // 移除常见动词
  foodName = foodName
    .replace(/吃了|喝了|吃了个|喝了杯|吃了一份/g, '')
    .trim()

  // 尝试从食物库中搜索
  const searchResults = searchFood(foodName)
  let matchedFood = null
  let grams = 100 // 默认 100g
  let caloriesPer100g = 100 // 默认值
  let matched = false

  if (searchResults.length > 0) {
    // 使用第一个匹配结果
    matchedFood = searchResults[0]
    grams = matchedFood.commonPortion
    caloriesPer100g = matchedFood.caloriesPer100g
    foodName = matchedFood.name
    matched = true
  } else {
    // 如果食物库没有匹配，使用标准份量表
    for (const [food, portion] of Object.entries(STANDARD_PORTIONS)) {
      if (foodName.includes(food)) {
        grams = portion
        foodName = food
        matched = true
        break
      }
    }
  }

  // 如果是模糊量词，按 50% 估算
  if (isVague) {
    grams = Math.round(grams * 0.5)
  }

  // 计算热量
  const calories = Math.round((caloriesPer100g * grams) / 100)

  return {
    foodName,
    grams,
    calories,
    confidence: matched ? 'medium' : 'low',
    note: matched ? undefined : '未匹配到食物库，请手动确认',
  }
}

/**
 * 测试规则引擎
 */
export function testRuleEngine() {
  const testCases = [
    '中午吃了碗兰州牛肉面，加了个卤蛋',
    '早餐吃了两片吐司和一杯牛奶',
    '晚上吃了点蔬菜和米饭',
    '喝了杯可乐，吃了个苹果',
  ]

  testCases.forEach(input => {
    console.log(`\n输入: ${input}`)
    const result = ruleEngine(input)
    console.log('餐别:', result.mealType)
    console.log('条目:')
    result.items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.foodName} ${item.grams}g ${item.calories}kcal (${item.confidence})`)
    })
    console.log('总热量:', result.totalCalories, 'kcal')
  })
}