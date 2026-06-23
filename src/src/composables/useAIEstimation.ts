import { ref } from 'vue'
import type { EstimateResult, EstimateMode } from '@/types'
import { aiEstimate, getEstimateMode, setEstimateMode, canUseLLM, getRecommendedMode } from '@/utils/aiEngine'
import { getLLMConfig, saveLLMConfig, testLLMConnection } from '@/utils/llmClient'
import type { LLMConfig } from '@/types'

export function useAIEstimation() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<EstimateResult | null>(null)
  const mode = ref<EstimateMode>(getEstimateMode())

  /**
   * 调用 AI 估算
   */
  async function estimate(input: string) {
    if (!input.trim()) {
      error.value = '请输入食物描述'
      return null
    }

    loading.value = true
    error.value = null
    result.value = null

    try {
      const estimateResult = await aiEstimate(input, mode.value)
      result.value = estimateResult
      return estimateResult
    } catch (err) {
      error.value = err instanceof Error ? err.message : '估算失败，请重试'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换估算模式
   */
  function switchMode(newMode: EstimateMode) {
    mode.value = newMode
    setEstimateMode(newMode)
  }

  /**
   * 更新 LLM 配置
   */
  function updateLLMConfig(config: Partial<LLMConfig>) {
    const currentConfig = getLLMConfig()
    const updatedConfig = { ...currentConfig, ...config }
    saveLLMConfig(updatedConfig)

    // 如果配置了 LLM，自动切换到推荐模式
    if (canUseLLM()) {
      const recommended = getRecommendedMode()
      switchMode(recommended)
    }
  }

  /**
   * 测试 LLM 连接
   */
  async function testConnection() {
    const config = getLLMConfig()
    return await testLLMConnection(config)
  }

  /**
   * 清除错误
   */
  function clearError() {
    error.value = null
  }

  /**
   * 清除结果
   */
  function clearResult() {
    result.value = null
    error.value = null
  }

  return {
    loading,
    error,
    result,
    mode,
    estimate,
    switchMode,
    updateLLMConfig,
    testConnection,
    clearError,
    clearResult,
  }
}