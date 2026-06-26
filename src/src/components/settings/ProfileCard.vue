<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">个人信息</h3>
      <button
        @click="showEditModal = true"
        class="px-4 py-2 bg-health-50 text-health-600 rounded-lg hover:bg-health-100 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
        </svg>
        <span class="text-sm font-medium">编辑信息</span>
      </button>
    </div>

    <!-- 个人信息卡片 -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-center gap-4">
        <!-- 头像图标 -->
        <div class="w-16 h-16 bg-health-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>

        <!-- 基本信息 -->
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-lg font-bold text-gray-800">
              {{ settings.gender === 'male' ? '男' : '女' }}
            </span>
            <span class="text-gray-400">·</span>
            <span class="text-gray-600">{{ settings.age }}岁</span>
            <span class="text-gray-400">·</span>
            <span class="text-gray-600">{{ settings.height }}cm</span>
          </div>
          <div class="text-sm text-gray-500 mb-2">
            当前体重：{{ settings.weight }}kg
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <div>
              <span class="text-gray-400">活动水平：</span>
              <span>{{ activityLevelText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 关键指标 -->
      <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">BMR</div>
          <div class="text-lg font-bold text-gray-800">{{ Math.round(settings.bmr) }}</div>
          <div class="text-xs text-gray-400">千卡/天</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">TDEE</div>
          <div class="text-lg font-bold text-gray-800">{{ Math.round(settings.tdee) }}</div>
          <div class="text-xs text-gray-400">千卡/天</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">预算</div>
          <div class="text-lg font-bold text-health-600">{{ Math.round(settings.dailyBudget) }}</div>
          <div class="text-xs text-gray-400">千卡/天</div>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 class="text-lg font-semibold text-gray-800">编辑个人信息</h3>
          <button
            @click="showEditModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- 表单内容 -->
        <div class="p-4 space-y-4">
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

          <!-- BMR 公式 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">BMR 计算公式</label>
            <select
              v-model="form.bmrFormula"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            >
              <option value="mifflin">Mifflin-St Jeor（默认，适合普通人）</option>
              <option value="harris">Harris-Benedict（经典公式，适合健身人群）</option>
              <option value="katch">Katch-McArdle（需要体脂率，最准确）</option>
            </select>
          </div>

          <!-- 实时计算结果 -->
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-sm text-gray-600 mb-2">计算结果</div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div>
                <div class="text-xs text-gray-500">BMR</div>
                <div class="font-bold text-gray-800">{{ Math.round(calculatedBMR) }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500">TDEE</div>
                <div class="font-bold text-gray-800">{{ Math.round(calculatedTDEE) }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500">预算</div>
                <div class="font-bold text-health-600">{{ Math.round(calculatedBudget) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            @click="handleSubmit"
            class="w-full py-3 bg-health-green text-white font-medium rounded-lg hover:bg-health-green-dark transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { BMRFormula } from '@/types'
import { useSettings } from '@/composables/useSettings'
import { calculateBMR, calculateTDEE, calculateDailyBudget } from '@/utils/calculator'

const { settings, updateProfile, updateBMRFormula } = useSettings()

const showEditModal = ref(false)

const form = ref({
  gender: settings.value.gender,
  age: settings.value.age,
  height: settings.value.height,
  weight: settings.value.weight,
  activityLevel: settings.value.activityLevel,
  bmrFormula: settings.value.bmrFormula || 'mifflin',
})

// 活动水平文本
const activityLevelText = computed(() => {
  const levels = {
    1: '久坐',
    2: '轻度',
    3: '中度',
    4: '高度',
    5: '极高',
  }
  return levels[settings.value.activityLevel as keyof typeof levels] || '久坐'
})

// 实时计算 BMR
const calculatedBMR = computed(() =>
  calculateBMR(
    form.value.gender,
    form.value.weight,
    form.value.height,
    form.value.age,
    undefined,
    form.value.bmrFormula as BMRFormula
  )
)

// 实时计算 TDEE
const calculatedTDEE = computed(() => calculateTDEE(calculatedBMR.value, form.value.activityLevel))

// 实时计算预算
const calculatedBudget = computed(() =>
  calculateDailyBudget(calculatedTDEE.value, settings.value.targetDeficit)
)

// 监听表单变化，实时更新计算结果
watch([() => form.value.gender, () => form.value.weight, () => form.value.height, () => form.value.age, () => form.value.activityLevel], () => {
  // 自动更新
})

function handleSubmit() {
  updateProfile({
    gender: form.value.gender,
    age: form.value.age,
    height: form.value.height,
    weight: form.value.weight,
    activityLevel: form.value.activityLevel,
  })
  updateBMRFormula(form.value.bmrFormula as BMRFormula)
  showEditModal.value = false
  alert('设置已保存')
}
</script>
