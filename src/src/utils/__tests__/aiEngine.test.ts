import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getEstimateMode, setEstimateMode, canUseLLM } from '../aiEngine'
import { storage } from '../storage'

// Mock storage
vi.mock('../storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

// Mock ruleEngine and llmClient
vi.mock('../ruleEngine', () => ({
  ruleEngine: vi.fn((_input: string) => ({
    mealType: '午餐' as const,
    items: [
      {
        foodName: '测试食物',
        grams: 100,
        calories: 100,
        confidence: 'medium' as const,
      },
    ],
    totalCalories: 100,
  })),
}))

vi.mock('../llmClient', () => ({
  getLLMConfig: vi.fn(() => ({
    apiEndpoint: '',
    apiKey: '',
    modelName: '',
    mode: 'rule' as const,
    timeoutMs: 10000,
    maxTokens: 512,
    createdAt: new Date().toISOString(),
  })),
  callLLM: vi.fn(),
  testLLMConnection: vi.fn(),
}))

describe('AI Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getEstimateMode', () => {
    it('should return default mode when no mode saved', () => {
      vi.mocked(storage.get).mockReturnValue(null)
      expect(getEstimateMode()).toBe('rule')
    })

    it('should return saved mode', () => {
      vi.mocked(storage.get).mockReturnValue('hybrid')
      expect(getEstimateMode()).toBe('hybrid')
    })
  })

  describe('setEstimateMode', () => {
    it('should save mode to storage', () => {
      setEstimateMode('llm')
      expect(storage.set).toHaveBeenCalledWith('estimate-mode', 'llm')
    })
  })

  describe('canUseLLM', () => {
    it('should return false when LLM is not configured', () => {
      expect(canUseLLM()).toBe(false)
    })
  })
})