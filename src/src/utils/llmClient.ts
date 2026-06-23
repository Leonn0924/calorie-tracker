import type { LLMConfig, AIEstimateItem, EstimateResult, MealType } from '@/types'
import { storage } from './storage'

const LLM_CONFIG_KEY = 'llm-config'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: LLMConfig = {
  apiEndpoint: '',
  apiKey: '',
  modelName: '',
  mode: 'rule',
  timeoutMs: 10000,
  maxTokens: 512,
  createdAt: new Date().toISOString(),
}

/**
 * 获取 LLM 配置
 */
export function getLLMConfig(): LLMConfig {
  return storage.get<LLMConfig>(LLM_CONFIG_KEY) || DEFAULT_CONFIG
}

/**
 * 保存 LLM 配置
 */
export function saveLLMConfig(config: LLMConfig): void {
  storage.set(LLM_CONFIG_KEY, config)
}

/**
 * 构造系统提示词
 */
function buildSystemPrompt(): string {
  return `你是一个食物热量估算助手。用户会描述一餐吃了什么，你需要：
1. 将描述拆分为多个独立食物条目
2. 推断每项食物的克数（基于标准份量常识）
3. 匹配食物名称（精确匹配，不要编造）
4. 返回结构化 JSON

输出格式要求（仅返回 JSON，不要多余文字）：
{
  "mealType": "早餐|午餐|晚餐|加餐",
  "items": [
    {
      "foodName": "食物名称",
      "grams": 克数,
      "calories": 热量（千卡）,
      "confidence": "high|medium|low",
      "note": "备注（如有特殊说明）"
    }
  ]
}

注意事项：
- 克数基于中国常见餐饮标准份量估算
- 如不确定可标注 confidence: low
- 不要编造食物名称，如不确定则用最接近的名称
- 餐别根据描述中的时间词推断
- 热量按每 100g 标准热量计算`
}

/**
 * 调用大模型 API
 */
export async function callLLM(
  input: string,
  config?: LLMConfig
): Promise<EstimateResult> {
  const llmConfig = config || getLLMConfig()

  if (!llmConfig.apiEndpoint || !llmConfig.apiKey || !llmConfig.modelName) {
    throw new Error('LLM 配置不完整，请先在设置中配置')
  }

  const systemPrompt = buildSystemPrompt()

  const requestBody = {
    model: llmConfig.modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input },
    ],
    max_tokens: llmConfig.maxTokens,
    temperature: 0.3,
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), llmConfig.timeoutMs)

    const response = await fetch(llmConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmConfig.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('API 返回内容为空')
    }

    // 解析 JSON
    const result = parseLLMResponse(content)
    return result
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('API 请求超时，请检查网络或增加超时时间')
      }
      throw error
    }
    throw new Error('API 调用失败')
  }
}

/**
 * 解析 LLM 返回的 JSON
 */
function parseLLMResponse(content: string): EstimateResult {
  // 尝试提取 JSON
  let jsonStr = content.trim()

  // 如果包含代码块，提取其中的 JSON
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  try {
    const parsed = JSON.parse(jsonStr)

    // 验证结构
    if (!parsed.mealType || !Array.isArray(parsed.items)) {
      throw new Error('JSON 结构不符合预期')
    }

    // 验证 mealType
    const validMealTypes = ['早餐', '午餐', '晚餐', '加餐']
    if (!validMealTypes.includes(parsed.mealType)) {
      parsed.mealType = '加餐' // 默认值
    }

    // 验证 items
    const items: AIEstimateItem[] = parsed.items.map((item: any) => ({
      foodName: item.foodName || '未知食物',
      grams: Number(item.grams) || 100,
      calories: Number(item.calories) || 100,
      confidence: item.confidence || 'medium',
      note: item.note,
    }))

    // 计算总热量
    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0)

    return {
      mealType: parsed.mealType as MealType,
      items,
      totalCalories,
    }
  } catch (error) {
    throw new Error('JSON 解析失败，请重试')
  }
}

/**
 * 测试 LLM 连接
 */
export async function testLLMConnection(config: LLMConfig): Promise<boolean> {
  try {
    const response = await callLLM('一个苹果', config)
    return response.items.length > 0
  } catch (error) {
    return false
  }
}