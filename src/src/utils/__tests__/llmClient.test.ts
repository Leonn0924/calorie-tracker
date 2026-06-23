import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLLMConfig, saveLLMConfig } from '../llmClient'
import { storage } from '../storage'

// Mock storage
vi.mock('../storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

describe('LLM Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLLMConfig', () => {
    it('should return default config when no config saved', () => {
      vi.mocked(storage.get).mockReturnValue(null)
      const config = getLLMConfig()
      expect(config.apiEndpoint).toBe('')
      expect(config.apiKey).toBe('')
      expect(config.mode).toBe('rule')
      expect(config.timeoutMs).toBe(10000)
    })

    it('should return saved config', () => {
      const savedConfig = {
        apiEndpoint: 'https://api.example.com',
        apiKey: 'test-key',
        modelName: 'gpt-4',
        mode: 'llm' as const,
        timeoutMs: 15000,
        maxTokens: 512,
        createdAt: new Date().toISOString(),
      }
      vi.mocked(storage.get).mockReturnValue(savedConfig)
      const config = getLLMConfig()
      expect(config.apiEndpoint).toBe('https://api.example.com')
      expect(config.apiKey).toBe('test-key')
      expect(config.mode).toBe('llm')
    })
  })

  describe('saveLLMConfig', () => {
    it('should save config to storage', () => {
      const config = {
        apiEndpoint: 'https://api.example.com',
        apiKey: 'test-key',
        modelName: 'gpt-4',
        mode: 'hybrid' as const,
        timeoutMs: 10000,
        maxTokens: 512,
        createdAt: new Date().toISOString(),
      }
      saveLLMConfig(config)
      expect(storage.set).toHaveBeenCalledWith('llm-config', config)
    })
  })
})