import { describe, it, expect } from 'vitest'
import { ruleEngine } from '../ruleEngine'

describe('Rule Engine', () => {
  describe('ruleEngine', () => {
    it('should split food items by commas', () => {
      const result = ruleEngine('中午吃了米饭，牛肉，蔬菜')
      expect(result.items).toHaveLength(3)
      expect(result.mealType).toBe('午餐')
    })

    it('should split food items by Chinese separators', () => {
      const result = ruleEngine('早餐吃了面包、牛奶、鸡蛋')
      expect(result.items.length).toBeGreaterThanOrEqual(2)
      expect(result.mealType).toBe('早餐')
    })

    it('should infer meal type from keywords', () => {
      expect(ruleEngine('早餐吃了面包').mealType).toBe('早餐')
      expect(ruleEngine('中午吃了米饭').mealType).toBe('午餐')
      expect(ruleEngine('晚上吃了面条').mealType).toBe('晚餐')
      expect(ruleEngine('宵夜吃了零食').mealType).toBe('加餐')
    })

    it('should use standard portions for common foods', () => {
      const result = ruleEngine('吃了碗米饭')
      const rice = result.items.find(item => item.foodName.includes('米饭'))
      expect(rice).toBeDefined()
      expect(rice?.grams).toBe(400) // 标准份量
    })

    it('should handle vague quantifiers', () => {
      const result = ruleEngine('吃了一点米饭')
      const rice = result.items.find(item => item.foodName.includes('米饭'))
      expect(rice).toBeDefined()
      expect(rice?.grams).toBe(100) // 标准份量 200g 的 50%
    })

    it('should mark low confidence for unknown foods', () => {
      const result = ruleEngine('吃了个未知食物')
      const unknown = result.items.find(item => item.foodName.includes('未知'))
      expect(unknown).toBeDefined()
      expect(unknown?.confidence).toBe('low')
    })

    it('should calculate total calories', () => {
      const result = ruleEngine('吃了米饭和鸡蛋')
      expect(result.totalCalories).toBeGreaterThan(0)
      const sum = result.items.reduce((sum, item) => sum + item.calories, 0)
      expect(result.totalCalories).toBe(sum)
    })

    it('should handle multiple items with different separators', () => {
      const result = ruleEngine('早餐吃了两片面包、一杯牛奶和两个鸡蛋')
      expect(result.items.length).toBeGreaterThanOrEqual(2)
    })

    it('should clean up food names', () => {
      const result = ruleEngine('喝了杯可乐')
      const cola = result.items.find(item => item.foodName.includes('可乐'))
      expect(cola).toBeDefined()
      expect(cola?.foodName).toBe('可乐')
    })

    it('should handle empty input gracefully', () => {
      const result = ruleEngine('')
      expect(result.items).toHaveLength(0)
      expect(result.totalCalories).toBe(0)
    })
  })
})