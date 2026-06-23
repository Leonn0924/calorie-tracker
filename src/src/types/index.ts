// 枚举定义
export type FoodCategory = '主食' | '肉类' | '蛋奶' | '蔬菜' | '水果' | '饮品' | '零食' | '豆类' | '坚果' | '调味品' | '其他'
export type MealType = '早餐' | '午餐' | '晚餐' | '加餐'
export type ActivityLevel = 1 | 2 | 3 | 4 | 5
export type DeficitStatus = 'in_deficit' | 'near_limit' | 'over_budget'
export type GoalMode = 'target' | 'advanced' | 'maintain' | 'bulk'
export type EstimateMode = 'rule' | 'llm' | 'hybrid'
export type RecordSource = 'ai' | 'manual'
export type Confidence = 'high' | 'medium' | 'low'
export type ExerciseSource = 'preset' | 'custom'

// 食物项
export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  caloriesPer100g: number
  unit: 'g' | 'ml'
  isBuiltin?: boolean
  isCustom?: boolean
  commonPortion?: number
  aliases?: string[]
  protein?: number      // 每100g蛋白质 (v1.1)
  carbs?: number        // 每100g碳水 (v1.1)
  fat?: number          // 每100g脂肪 (v1.1)
  createdAt?: string
}

// 饮食记录
export interface MealRecord {
  id: string
  date: string               // YYYY-MM-DD
  mealType: MealType
  foodId: string
  foodName: string
  caloriesPer100g: number
  grams: number
  calories: number
  source: RecordSource
  confidence?: Confidence
  rawInput?: string
  createdAt: string
}

// 用户设置
export interface UserSettings {
  gender: 'male' | 'female'
  height: number
  weight: number
  age: number
  goalMode: GoalMode
  targetWeight?: number
  targetDays?: number
  activityLevel: ActivityLevel
  targetDeficit: number
  bmr: number
  tdee: number
  dailyBudget: number
}

// 大模型配置
export interface LLMConfig {
  apiEndpoint: string
  apiKey: string
  modelName: string
  mode: EstimateMode
  timeoutMs: number
  maxTokens: number
  createdAt: string
  lastTestedAt?: string
}

// 体重记录
export interface WeightRecord {
  id: string
  date: string
  weight: number
  createdAt: string
}

// 运动记录
export interface ExerciseRecord {
  id: string
  date: string
  type: string
  name: string
  icon: string
  duration: number
  calories: number
  source?: ExerciseSource
  createdAt: string
}

// 运动预设
export interface ExercisePreset {
  id: string
  name: string
  icon: string
  metValue: number
  category: string
}

// AI 估算项
export interface AIEstimateItem {
  foodName: string
  grams: number
  calories: number
  confidence: Confidence
  note?: string
}

// AI 估算结果
export interface EstimateResult {
  mealType: MealType
  items: AIEstimateItem[]
  totalCalories: number
}

// 今日统计
export interface DailyStats {
  date: string
  budget: number
  intake: number
  exercise: number
  netDeficit: number
  status: DeficitStatus
  meals: MealRecord[]
  exercises: ExerciseRecord[]
}