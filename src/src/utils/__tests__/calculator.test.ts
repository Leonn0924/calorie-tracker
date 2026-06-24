import { describe, it, expect } from 'vitest'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetDeficit,
  calculateDailyBudget,
  calculateNetDeficit,
  getDeficitStatus,
  isBudgetSafe,
  isDeficitSafe,
  calculateCalories,
  calculateDeficitByMode,
} from '@/utils/calculator'

describe('Calculator Utils', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR for male correctly', () => {
      // Example: 30岁男性, 75kg, 175cm
      // BMR = 10×75 + 6.25×175 - 5×30 + 5 = 750 + 1093.75 - 150 + 5 = 1698.75
      const bmr = calculateBMR('male', 75, 175, 30)
      expect(bmr).toBeCloseTo(1698.75, 2)
    })

    it('should calculate BMR for female correctly', () => {
      // Example: 25岁女性, 60kg, 165cm
      // BMR = 10×60 + 6.25×165 - 5×25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
      const bmr = calculateBMR('female', 60, 165, 25)
      expect(bmr).toBeCloseTo(1345.25, 2)
    })
  })

  describe('calculateTDEE', () => {
    it('should calculate TDEE with different activity levels', () => {
      const bmr = 1700

      // 久坐 (1.2)
      expect(calculateTDEE(bmr, 1)).toBeCloseTo(2040, 2)
      // 轻度 (1.375)
      expect(calculateTDEE(bmr, 2)).toBeCloseTo(2337.5, 2)
      // 中度 (1.55)
      expect(calculateTDEE(bmr, 3)).toBeCloseTo(2635, 2)
      // 高度 (1.725)
      expect(calculateTDEE(bmr, 4)).toBeCloseTo(2932.5, 2)
      // 极高度 (1.9)
      expect(calculateTDEE(bmr, 5)).toBeCloseTo(3230, 2)
    })
  })

  describe('calculateTargetDeficit', () => {
    it('should calculate deficit for weight loss', () => {
      // 80kg → 75kg in 90 days
      // Weight diff = -5kg
      // Total calories = -5 × 7700 = -38500
      // Daily deficit = -38500 / 90 = -427.78
      const deficit = calculateTargetDeficit(80, 75, 90)
      expect(deficit).toBeCloseTo(-427.78, 2)
    })

    it('should calculate surplus for weight gain', () => {
      // 70kg → 75kg in 60 days
      // Weight diff = 5kg
      // Total calories = 5 × 7700 = 38500
      // Daily surplus = 38500 / 60 = 641.67
      const deficit = calculateTargetDeficit(70, 75, 60)
      expect(deficit).toBeCloseTo(641.67, 2)
    })

    it('should return 0 for maintain weight', () => {
      const deficit = calculateTargetDeficit(75, 75, 90)
      expect(deficit).toBe(0)
    })
  })

  describe('calculateDailyBudget', () => {
    it('should calculate daily budget correctly', () => {
      const tdee = 2500
      const deficit = -400  // 减脂缺口（负数）
      const budget = calculateDailyBudget(tdee, deficit)
      expect(budget).toBe(2100) // 2500 + (-400) = 2100
    })

    it('should handle positive deficit (surplus)', () => {
      const tdee = 2500
      const deficit = 300  // 增重盈余（正数）
      const budget = calculateDailyBudget(tdee, deficit)
      expect(budget).toBe(2800) // 2500 + 300 = 2800
    })
  })

  describe('calculateNetDeficit', () => {
    it('should calculate net deficit with exercise', () => {
      const budget = 2000
      const intake = 1500
      const exercise = 300
      const netDeficit = calculateNetDeficit(budget, intake, exercise)
      // 2000 + 300 - 1500 = 800
      expect(netDeficit).toBe(800)
    })

    it('should return negative when over budget', () => {
      const budget = 2000
      const intake = 2500
      const exercise = 200
      const netDeficit = calculateNetDeficit(budget, intake, exercise)
      // 2000 + 200 - 2500 = -300
      expect(netDeficit).toBe(-300)
    })
  })

  describe('getDeficitStatus', () => {
    it('should return in_deficit when intake <= budget', () => {
      const status = getDeficitStatus(1800, 2000, 2500)
      expect(status).toBe('in_deficit')
    })

    it('should return near_limit when budget < intake <= tdee', () => {
      const status = getDeficitStatus(2200, 2000, 2500)
      expect(status).toBe('near_limit')
    })

    it('should return over_budget when intake > tdee', () => {
      const status = getDeficitStatus(2800, 2000, 2500)
      expect(status).toBe('over_budget')
    })

    it('should handle exact budget', () => {
      const status = getDeficitStatus(2000, 2000, 2500)
      expect(status).toBe('in_deficit')
    })

    it('should handle exact tdee', () => {
      const status = getDeficitStatus(2500, 2000, 2500)
      expect(status).toBe('near_limit')
    })
  })

  describe('isBudgetSafe', () => {
    it('should return true when budget >= bmr * 0.8', () => {
      const bmr = 1700
      const budget = 1400 // 1700 * 0.8 = 1360
      expect(isBudgetSafe(budget, bmr)).toBe(true)
    })

    it('should return false when budget < bmr * 0.8', () => {
      const bmr = 1700
      const budget = 1300 // 1700 * 0.8 = 1360
      expect(isBudgetSafe(budget, bmr)).toBe(false)
    })
  })

  describe('isDeficitSafe', () => {
    it('should return true when |deficit| <= 1000', () => {
      expect(isDeficitSafe(-800)).toBe(true)
      expect(isDeficitSafe(800)).toBe(true)
      expect(isDeficitSafe(1000)).toBe(true)
    })

    it('should return false when |deficit| > 1000', () => {
      expect(isDeficitSafe(-1200)).toBe(false)
      expect(isDeficitSafe(1200)).toBe(false)
    })
  })

  describe('calculateCalories', () => {
    it('should calculate calories correctly', () => {
      // 116 kcal/100g × 200g = 232 kcal
      const calories = calculateCalories(116, 200)
      expect(calories).toBe(232)
    })

    it('should handle decimal values', () => {
      // 165 kcal/100g × 150g = 247.5 kcal
      const calories = calculateCalories(165, 150)
      expect(calories).toBe(247.5)
    })
  })

  describe('calculateDeficitByMode', () => {
    it('should calculate deficit for target mode', () => {
      const deficit = calculateDeficitByMode('target', 80, 75, 90)
      expect(deficit).toBeCloseTo(-427.78, 2)
    })

    it('should return 0 for maintain mode', () => {
      const deficit = calculateDeficitByMode('maintain', 75, 75, 90)
      expect(deficit).toBe(0)
    })

    it('should calculate surplus for bulk mode', () => {
      const deficit = calculateDeficitByMode('bulk', 70, 75, 60)
      expect(deficit).toBeCloseTo(641.67, 2)
    })

    it('should return 0 for advanced mode', () => {
      const deficit = calculateDeficitByMode('advanced', 80, 75, 90)
      expect(deficit).toBe(0)
    })
  })
})