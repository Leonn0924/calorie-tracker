<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">目标设置</h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 目标模式 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">目标模式</label>
        <select
          v-model="form.goalMode"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
        >
          <option value="target">目标模式（推荐）</option>
          <option value="advanced">高级模式</option>
          <option value="maintain">维持模式</option>
          <option value="bulk">增肌模式</option>
        </select>
      </div>

      <!-- 目标模式：目标体重和周期 -->
      <div v-if="form.goalMode === 'target'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目标体重 (kg)</label>
          <input
            v-model.number="form.targetWeight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            placeholder="请输入目标体重"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目标周期（天）</label>
          <input
            v-model.number="form.targetDays"
            type="number"
            min="7"
            max="365"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            placeholder="请输入目标天数"
          />
        </div>

        <!-- 计算结果 -->
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-600 mb-2">每日缺口</div>
          <div class="text-2xl font-bold" :class="targetDeficit < 0 ? 'text-green-600' : 'text-red-600'">
            {{ targetDeficit > 0 ? '+' : '' }}{{ Math.round(targetDeficit) }}
            <span class="text-sm font-normal text-gray-500">千卡/天</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ targetDeficit < 0 ? '减脂模式' : targetDeficit > 0 ? '增重模式' : '维持模式' }}
          </div>
        </div>
      </div>

      <!-- 高级模式：直接填写缺口 -->
      <div v-if="form.goalMode === 'advanced'">
        <label class="block text-sm font-medium text-gray-700 mb-2">每日缺口 (千卡)</label>
        <input
          v-model.number="form.targetDeficit"
          type="number"
          min="-2000"
          max="2000"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="负数表示减脂，正数表示增重"
        />
        <div class="text-xs text-gray-500 mt-1">
          负数 = 减脂（如 -500），正数 = 增重（如 +300），0 = 维持
        </div>
      </div>

      <!-- 维持模式 -->
      <div v-if="form.goalMode === 'maintain'" class="p-4 bg-blue-50 rounded-lg">
        <div class="text-sm text-blue-700">
          维持模式：每日缺口为 0，保持当前体重
        </div>
      </div>

      <!-- 增肌模式 -->
      <div v-if="form.goalMode === 'bulk'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目标体重 (kg)</label>
          <input
            v-model.number="form.targetWeight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            placeholder="请输入目标体重"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目标周期（天）</label>
          <input
            v-model.number="form.targetDays"
            type="number"
            min="7"
            max="365"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            placeholder="请输入目标天数"
          />
        </div>

        <div class="p-4 bg-orange-50 rounded-lg">
          <div class="text-sm text-orange-700">
            增肌模式：每日盈余 {{ Math.round(targetDeficit) }} 千卡
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <button
        type="submit"
        class="w-full py-3 bg-health-green text-white font-medium rounded-lg hover:bg-health-green-dark transition-colors shadow-sm"
      >
        保存设置
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GoalMode } from '@/types'
import { useSettings } from '@/composables/useSettings'
import { calculateTargetDeficit } from '@/utils/calculator'

const { settings, updateGoal } = useSettings()

const form = ref({
  goalMode: settings.value.goalMode as GoalMode,
  targetWeight: settings.value.targetWeight || settings.value.weight,
  targetDays: settings.value.targetDays || 90,
  targetDeficit: settings.value.targetDeficit,
})

// 监听 settings 变化，同步到 form（防止数据不同步）
watch(() => settings.value.targetWeight, (newTargetWeight) => {
  if (newTargetWeight && newTargetWeight !== form.value.targetWeight) {
    form.value.targetWeight = newTargetWeight
  }
})

watch(() => settings.value.targetDays, (newTargetDays) => {
  if (newTargetDays && newTargetDays !== form.value.targetDays) {
    form.value.targetDays = newTargetDays
  }
})

// 监听当前体重变化，更新目标体重的默认值
watch(() => settings.value.weight, (newWeight, oldWeight) => {
  // 如果之前没有设置过目标体重，或者目标体重等于旧体重，则自动更新
  if (!settings.value.targetWeight || settings.value.targetWeight === oldWeight) {
    form.value.targetWeight = newWeight
  }
  console.log('当前体重变化:', oldWeight, '→', newWeight)
  console.log('目标体重更新为:', form.value.targetWeight)
})

// 计算目标缺口
const targetDeficit = computed(() => {
  if (form.value.goalMode === 'target' || form.value.goalMode === 'bulk') {
    return calculateTargetDeficit(
      settings.value.weight,
      form.value.targetWeight,
      form.value.targetDays
    )
  } else if (form.value.goalMode === 'maintain') {
    return 0
  } else {
    return form.value.targetDeficit
  }
})

function handleSubmit() {
  console.log('保存目标设置:', {
    goalMode: form.value.goalMode,
    targetWeight: form.value.targetWeight,
    targetDays: form.value.targetDays,
    currentWeight: settings.value.weight,
  })

  updateGoal(
    form.value.goalMode,
    form.value.goalMode === 'target' || form.value.goalMode === 'bulk' ? form.value.targetWeight : undefined,
    form.value.goalMode === 'target' || form.value.goalMode === 'bulk' ? form.value.targetDays : undefined
  )

  // 如果是高级模式，直接保存缺口值
  if (form.value.goalMode === 'advanced') {
    // 这里需要更新 settings 中的 targetDeficit
    // 暂时简单处理
  }

  console.log('保存后的 settings:', settings.value)
  alert('目标设置已保存')
}
</script>
