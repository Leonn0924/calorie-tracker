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
 * 计算基础代谢率 (Mifflin-St Jeor 公式)
 * @param gender 性别
 * @param weight 体重 (kg)
 * @param height 身高 (cm)
 * @param age 年龄
 * @returns BMR (千卡/天)
 */
export function calculateBMR(
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
 * @param targetDeficit 目标缺口
 * @returns 每日预算 (千卡)
 */
export function calculateDailyBudget(tdee: number, targetDeficit: number): number {
  return tdee - targetDeficit
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