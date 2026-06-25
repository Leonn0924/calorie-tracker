import type { ActivityLevel, DeficitStatus, GoalMode } from '@/types'

/**
 * 活动系数映射
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  1: 1.2,    // 久坐
  2: 1.375,  // 轻度
  3: 1.55,   // 中度
  4: 1.725,  // 高度
  5: 1.9     // 极高度
}

/**
 * BMR 公式类型
 */
export type BMRFormula = 'mifflin' | 'harris' | 'katch'

/**
 * 计算基础代谢率 - Mifflin-St Jeor 公式（默认，适合普通人）
 * @param gender 性别
 * @param weight 体重 (kg)
 * @param height 身高 (cm)
 * @param age 年龄
 * @returns BMR (千卡/天)
 */
export function calculateBMR_Mifflin(
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

/**
 * 计算基础代谢率 - Harris-Benedict 公式（经典公式，适合健身人群）
 * @param gender 性别
 * @param weight 体重 (kg)
 * @param height 身高 (cm)
 * @param age 年龄
 * @returns BMR (千卡/天)
 */
export function calculateBMR_HarrisBenedict(
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number
): number {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
  }
}

/**
 * 计算基础代谢率 - Katch-McArdle 公式（需要体脂率，最准确）
 * @param weight 体重 (kg)
 * @param bodyFatPercentage 体脂率 (0-100)
 * @returns BMR (千卡/天)
 */
export function calculateBMR_KatchMcArdle(
  weight: number,
  bodyFatPercentage: number
): number {
  const leanMass = weight * (1 - bodyFatPercentage / 100)
  return 370 + (21.6 * leanMass)
}

/**
 * 计算基础代谢率（统一入口）
 * @param gender 性别
 * @param weight 体重 (kg)
 * @param height 身高 (cm)
 * @param age 年龄
 * @param bodyFatPercentage 体脂率（可选，Katch-McArdle 公式需要）
 * @param formula 公式类型（默认 mifflin）
 * @returns BMR (千卡/天)
 */
export function calculateBMR(
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number,
  bodyFatPercentage?: number,
  formula: BMRFormula = 'mifflin'
): number {
  switch (formula) {
    case 'harris':
      return calculateBMR_HarrisBenedict(gender, weight, height, age)
    case 'katch':
      if (!bodyFatPercentage) {
        // 如果没有体脂率，降级使用 Mifflin 公式
        return calculateBMR_Mifflin(gender, weight, height, age)
      }
      return calculateBMR_KatchMcArdle(weight, bodyFatPercentage)
    case 'mifflin':
    default:
      return calculateBMR_Mifflin(gender, weight, height, age)
  }
}

/**
 * 计算每日总消耗 (TDEE)
 * @param bmr 基础代谢
 * @param activityLevel 活动系数
 * @returns TDEE (千卡/天)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}

/**
 * 计算目标缺口
 * @param currentWeight 当前体重 (kg)
 * @param targetWeight 目标体重 (kg)
 * @param targetDays 目标天数
 * @returns 每日缺口 (千卡/天，负数为减脂，正数为增重)
 */
export function calculateTargetDeficit(
  currentWeight: number,
  targetWeight: number,
  targetDays: number
): number {
  const weightDiff = targetWeight - currentWeight
  const totalCalories = weightDiff * 7700 // 1kg 脂肪 ≈ 7700 千卡
  return totalCalories / targetDays
}

/**
 * 计算每日饮食预算
 * @param tdee 每日总消耗
 * @param targetDeficit 目标缺口（负数表示减脂，正数表示增重）
 * @returns 每日预算 (千卡)
 */
export function calculateDailyBudget(tdee: number, targetDeficit: number): number {
  // 预算 = TDEE + 目标缺口
  // 减脂时缺口为负：预算 = TDEE + (-500) = TDEE - 500
  // 增重时缺口为正：预算 = TDEE + 300
  return tdee + targetDeficit
}

/**
 * 计算净缺口（含运动消耗）
 * @param dailyBudget 每日预算
 * @param totalIntake 总摄入
 * @param totalExercise 总运动消耗
 * @returns 净缺口 (千卡)
 */
export function calculateNetDeficit(
  dailyBudget: number,
  totalIntake: number,
  totalExercise: number
): number {
  return dailyBudget + totalExercise - totalIntake
}

/**
 * 判定缺口状态
 * @param totalIntake 总摄入
 * @param dailyBudget 每日预算
 * @param tdee 每日总消耗
 * @returns 缺口状态
 */
export function getDeficitStatus(
  totalIntake: number,
  dailyBudget: number,
  tdee: number
): DeficitStatus {
  if (totalIntake <= dailyBudget) {
    return 'in_deficit'      // 绿色
  } else if (totalIntake <= tdee) {
    return 'near_limit'      // 黄色
  } else {
    return 'over_budget'     // 红色
  }
}

/**
 * 安全校验：预算是否过低
 * @param budget 每日预算
 * @param bmr 基础代谢
 * @returns 是否安全
 */
export function isBudgetSafe(budget: number, bmr: number): boolean {
  return budget >= bmr * 0.8
}

/**
 * 安全校验：缺口是否过大
 * @param deficit 目标缺口
 * @returns 是否安全
 */
export function isDeficitSafe(deficit: number): boolean {
  return Math.abs(deficit) <= 1000
}

/**
 * 计算食物热量
 * @param caloriesPer100g 每100g热量
 * @param grams 克数
 * @returns 热量 (千卡)
 */
export function calculateCalories(caloriesPer100g: number, grams: number): number {
  return (caloriesPer100g * grams) / 100
}

/**
 * 根据模式计算目标缺口
 * @param mode 目标模式
 * @param currentWeight 当前体重
 * @param targetWeight 目标体重
 * @param targetDays 目标天数
 * @returns 目标缺口
 */
export function calculateDeficitByMode(
  mode: GoalMode,
  currentWeight: number,
  targetWeight: number,
  targetDays: number
): number {
  switch (mode) {
    case 'target':
      return calculateTargetDeficit(currentWeight, targetWeight, targetDays)
    case 'maintain':
      return 0
    case 'bulk':
      return calculateTargetDeficit(currentWeight, targetWeight, targetDays)
    case 'advanced':
      return 0 // 高级模式由用户直接填写
    default:
      return 0
  }
}