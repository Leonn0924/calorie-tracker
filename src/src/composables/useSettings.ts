import { ref, computed, watch } from 'vue'
import type { UserSettings, ActivityLevel, GoalMode, EstimateMode, LLMConfig, BMRFormula } from '@/types'
import { storage } from '@/utils/storage'
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyBudget,
  calculateTargetDeficit,
  calculateDeficitByMode,
  isBudgetSafe,
  isDeficitSafe,
} from '@/utils/calculator'

const SETTINGS_KEY = 'settings'

// 默认设置
const defaultSettings: UserSettings = {
  gender: 'male',
  height: 175,
  weight: 80,
  age: 30,
  goalMode: 'target',
  targetWeight: 75,
  targetDays: 90,
  activityLevel: 2,
  targetDeficit: -428,
  bmr: 1749,
  tdee: 2405,
  dailyBudget: 2833,
  estimateMode: 'rule',
}

export function useSettings() {
  // 从存储中加载设置
  const settings = ref<UserSettings>(
    storage.get<UserSettings>(SETTINGS_KEY) || defaultSettings
  )

  // 监听设置变化并重新计算
  watch(settings, (newSettings) => {
    // 计算 BMR（支持多种公式）
    newSettings.bmr = calculateBMR(
      newSettings.gender,
      newSettings.weight,
      newSettings.height,
      newSettings.age,
      newSettings.bodyFatPercentage,
      newSettings.bmrFormula || 'mifflin'
    )

    // 计算 TDEE
    newSettings.tdee = calculateTDEE(newSettings.bmr, newSettings.activityLevel)

    // 计算目标缺口
    if (newSettings.goalMode === 'target' && newSettings.targetWeight && newSettings.targetDays) {
      newSettings.targetDeficit = calculateTargetDeficit(
        newSettings.weight,
        newSettings.targetWeight,
        newSettings.targetDays
      )
    } else if (newSettings.goalMode === 'advanced') {
      // 高级模式保持用户填写的值
    } else {
      newSettings.targetDeficit = calculateDeficitByMode(
        newSettings.goalMode,
        newSettings.weight,
        newSettings.targetWeight || newSettings.weight,
        newSettings.targetDays || 90
      )
    }

    // 计算每日预算
    newSettings.dailyBudget = calculateDailyBudget(newSettings.tdee, newSettings.targetDeficit)

    // 保存到存储
    storage.set(SETTINGS_KEY, newSettings)
  }, { deep: true })

  // 安全校验
  const budgetSafe = computed(() => isBudgetSafe(settings.value.dailyBudget, settings.value.bmr))
  const deficitSafe = computed(() => isDeficitSafe(settings.value.targetDeficit))

  // 更新个人信息
  function updateProfile(profile: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...profile }
  }

  // 更新目标设置
  function updateGoal(mode: GoalMode, targetWeight?: number, targetDays?: number) {
    settings.value.goalMode = mode
    if (targetWeight !== undefined) {
      settings.value.targetWeight = targetWeight
    }
    if (targetDays !== undefined) {
      settings.value.targetDays = targetDays
    }
  }

  // 更新活动系数
  function updateActivityLevel(level: ActivityLevel) {
    settings.value.activityLevel = level
  }

  // 更新估算模式
  function updateEstimateMode(mode: EstimateMode) {
    settings.value.estimateMode = mode
  }

  // 更新 LLM 配置
  function updateLLMConfig(config: LLMConfig) {
    settings.value.llmConfig = config
  }

  // 更新 BMR 公式
  function updateBMRFormula(formula: BMRFormula, bodyFatPercentage?: number) {
    settings.value.bmrFormula = formula
    if (bodyFatPercentage !== undefined) {
      settings.value.bodyFatPercentage = bodyFatPercentage
    }
  }

  // 重置为默认设置
  function resetSettings() {
    settings.value = defaultSettings
  }

  return {
    settings,
    budgetSafe,
    deficitSafe,
    updateProfile,
    updateGoal,
    updateActivityLevel,
    updateEstimateMode,
    updateLLMConfig,
    updateBMRFormula,
    resetSettings,
  }
}