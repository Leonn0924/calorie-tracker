import type { EstimateResult, EstimateMode, LLMConfig } from '@/types'
import { ruleEngine } from './ruleEngine'
import { callLLM, getLLMConfig } from './llmClient'
import { storage } from './storage'

const MODE_KEY = 'estimate-mode'

/**
 * 获取当前估算模式
 */
export function getEstimateMode(): EstimateMode {
  return storage.get<EstimateMode>(MODE_KEY) || 'rule'
}

/**
 * 设置估算模式
 */
export function setEstimateMode(mode: EstimateMode): void {
  storage.set(MODE_KEY, mode)
}

/**
 * AI 估算引擎：根据模式选择规则引擎或大模型
 */
export async function aiEstimate(
  input: string,
  mode?: EstimateMode
): Promise<EstimateResult> {
  const currentMode = mode || getEstimateMode()

  switch (currentMode) {
    case 'rule':
      return ruleEngine(input)

    case 'llm':
      try {
        return await callLLM(input)
      } catch (error) {
        // LLM 失败时降级到规则引擎
        console.warn('LLM 调用失败，降级到规则引擎:', error)
        return ruleEngine(input)
      }

    case 'hybrid':
      return await hybridEstimate(input)

    default:
      return ruleEngine(input)
  }
}

/**
 * 混合模式：规则引擎优先，低置信度项调用 LLM 兜底
 */
async function hybridEstimate(input: string): Promise<EstimateResult> {
  // 1. 先用规则引擎
  const ruleResult = ruleEngine(input)

  // 2. 检查是否有低置信度项
  const lowConfidenceItems = ruleResult.items.filter(
    item => item.confidence === 'low'
  )

  // 3. 如果所有项都是中高置信度，直接返回
  if (lowConfidenceItems.length === 0) {
    return ruleResult
  }

  // 4. 否则调用 LLM
  try {
    const llmResult = await callLLM(input)

    // 5. 合并结果：优先使用 LLM 的高置信度结果
    const mergedItems = ruleResult.items.map(ruleItem => {
      if (ruleItem.confidence === 'low') {
        // 查找 LLM 中对应的项
        const llmItem = llmResult.items.find(
          item => item.foodName === ruleItem.foodName ||
                  item.foodName.includes(ruleItem.foodName) ||
                  ruleItem.foodName.includes(item.foodName)
        )

        // 如果 LLM 有结果且置信度更高，使用 LLM 结果
        if (llmItem && llmItem.confidence !== 'low') {
          return llmItem
        }
      }
      return ruleItem
    })

    // 6. 添加 LLM 独有的项
    const mergedFoodNames = new Set(mergedItems.map(item => item.foodName))
    for (const llmItem of llmResult.items) {
      if (!mergedFoodNames.has(llmItem.foodName)) {
        mergedItems.push(llmItem)
      }
    }

    // 7. 重新计算总热量
    const totalCalories = mergedItems.reduce((sum, item) => sum + item.calories, 0)

    return {
      mealType: llmResult.mealType,
      items: mergedItems,
      totalCalories,
    }
  } catch (error) {
    // LLM 失败时返回规则引擎结果
    console.warn('混合模式中 LLM 调用失败，使用规则引擎结果:', error)
    return ruleResult
  }
}

/**
 * 检查是否可以调用 LLM
 */
export function canUseLLM(): boolean {
  const config = getLLMConfig()
  return !!(config.apiEndpoint && config.apiKey && config.modelName)
}

/**
 * 获取推荐模式
 */
export function getRecommendedMode(): EstimateMode {
  return canUseLLM() ? 'hybrid' : 'rule'
}