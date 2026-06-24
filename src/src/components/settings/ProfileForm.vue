<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">个人信息</h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 性别 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">性别</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="form.gender"
              type="radio"
              value="male"
              class="w-4 h-4 text-health-600"
            />
            <span class="text-sm text-gray-700">男</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="form.gender"
              type="radio"
              value="female"
              class="w-4 h-4 text-health-600"
            />
            <span class="text-sm text-gray-700">女</span>
          </label>
        </div>
      </div>

      <!-- 年龄 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">年龄</label>
        <input
          v-model.number="form.age"
          type="number"
          min="10"
          max="120"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="请输入年龄"
        />
      </div>

      <!-- 身高 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
        <input
          v-model.number="form.height"
          type="number"
          min="100"
          max="250"
          step="0.1"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="请输入身高"
        />
      </div>

      <!-- 体重 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">当前体重 (kg)</label>
        <input
          v-model.number="form.weight"
          type="number"
          min="30"
          max="300"
          step="0.1"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="请输入体重"
        />
      </div>

      <!-- 活动水平 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">活动水平</label>
        <select
          v-model.number="form.activityLevel"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
        >
          <option :value="1">久坐（几乎不运动）</option>
          <option :value="2">轻度活动（每周 1-3 天）</option>
          <option :value="3">中度活动（每周 3-5 天）</option>
          <option :value="4">高度活动（每周 6-7 天）</option>
          <option :value="5">极高度活动（体力劳动）</option>
        </select>
      </div>

      <!-- 计算结果展示 -->
      <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div class="text-center">
          <div class="text-sm text-gray-500 mb-1">BMR</div>
          <div class="text-xl font-bold text-gray-800">{{ Math.round(bmr) }}</div>
          <div class="text-xs text-gray-400">千卡/天</div>
        </div>
        <div class="text-center">
          <div class="text-sm text-gray-500 mb-1">TDEE</div>
          <div class="text-xl font-bold text-gray-800">{{ Math.round(tdee) }}</div>
          <div class="text-xs text-gray-400">千卡/天</div>
        </div>
        <div class="text-center">
          <div class="text-sm text-gray-500 mb-1">预算</div>
          <div class="text-xl font-bold text-health-600">{{ Math.round(budget) }}</div>
          <div class="text-xs text-gray-400">千卡/天</div>
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
import { ref, computed } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { calculateBMR, calculateTDEE, calculateDailyBudget } from '@/utils/calculator'

const { settings, updateProfile } = useSettings()

const form = ref({
  gender: settings.value.gender,
  age: settings.value.age,
  height: settings.value.height,
  weight: settings.value.weight,
  activityLevel: settings.value.activityLevel,
})

// 实时计算 BMR
const bmr = computed(() =>
  calculateBMR(form.value.gender, form.value.weight, form.value.height, form.value.age)
)

// 实时计算 TDEE
const tdee = computed(() => calculateTDEE(bmr.value, form.value.activityLevel))

// 实时计算预算
const budget = computed(() =>
  calculateDailyBudget(tdee.value, settings.value.targetDeficit)
)

function handleSubmit() {
  updateProfile({
    gender: form.value.gender,
    age: form.value.age,
    height: form.value.height,
    weight: form.value.weight,
    activityLevel: form.value.activityLevel,
  })
  alert('设置已保存')
}
</script>
