<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        运动消耗
      </h3>
      <div class="text-right">
        <div class="text-2xl font-bold text-health-600">
          {{ todayExerciseCalories }}
          <span class="text-sm font-normal text-gray-500">kcal</span>
        </div>
        <div class="text-xs text-gray-500">今日消耗</div>
      </div>
    </div>

    <!-- 运动快捷选择 -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">快捷添加</h4>
      <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <button
          v-for="preset in exercisePresets"
          :key="preset.id"
          @click="selectPreset(preset)"
          class="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-health-500 hover:bg-health-50 transition-all"
        >
          <span class="text-2xl mb-1">{{ preset.icon }}</span>
          <span class="text-xs text-gray-700">{{ preset.name }}</span>
        </button>
      </div>
    </div>

    <!-- 运动输入表单 -->
    <div v-if="selectedPreset || showCustomForm" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-700">
          {{ selectedPreset ? `${selectedPreset.icon} ${selectedPreset.name}` : '自定义运动' }}
        </h4>
        <button
          @click="cancelSelection"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-3">
        <!-- 自定义运动名称 -->
        <div v-if="!selectedPreset">
          <label class="block text-xs text-gray-600 mb-1">运动名称</label>
          <input
            v-model="customName"
            type="text"
            placeholder="输入运动名称"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          />
        </div>

        <!-- 时长输入 -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">运动时长（分钟）</label>
          <input
            v-model.number="duration"
            type="number"
            min="1"
            placeholder="30"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          />
        </div>

        <!-- 消耗计算 -->
        <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
          <span class="text-sm text-gray-600">预计消耗</span>
          <span class="text-lg font-bold text-health-600">
            {{ calculatedCalories }} kcal
          </span>
        </div>

        <!-- 添加按钮 -->
        <button
          @click="addExerciseRecord"
          :disabled="!canAdd"
          class="w-full py-2 bg-health-500 text-white rounded-lg hover:bg-health-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          添加记录
        </button>
      </div>
    </div>

    <!-- 自定义运动按钮 -->
    <div v-if="!selectedPreset && !showCustomForm" class="mb-6">
      <button
        @click="showCustomForm = true"
        class="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-health-500 hover:text-health-600 transition-colors"
      >
        + 自定义运动
      </button>
    </div>

    <!-- 运动日志列表 -->
    <div v-if="todayExercises.length > 0">
      <h4 class="text-sm font-medium text-gray-700 mb-3">今日记录</h4>
      <div class="space-y-2">
        <div
          v-for="exercise in todayExercises"
          :key="exercise.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ exercise.icon }}</span>
            <div>
              <div class="font-medium text-gray-800">{{ exercise.name }}</div>
              <div class="text-xs text-gray-500">{{ exercise.duration }} 分钟</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="font-semibold text-health-600">+{{ exercise.calories }} kcal</div>
            </div>
            <button
              @click="removeExerciseRecord(exercise.id)"
              class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-8 text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
      <p class="text-sm">还没有运动记录</p>
      <p class="text-xs mt-1">选择上方运动或自定义添加</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ExercisePreset } from '@/types'
import { exercisePresets } from '@/data/exercises'
import { useExercise } from '@/composables/useExercise'
import { useSettings } from '@/composables/useSettings'
import { getToday } from '@/utils/date'

const { todayExercises, todayExerciseCalories, addExercise, removeExercise } = useExercise()
const { settings } = useSettings()

const selectedPreset = ref<ExercisePreset | null>(null)
const showCustomForm = ref(false)
const customName = ref('')
const duration = ref<number>(30)

/**
 * 计算消耗热量
 * 公式：MET × 体重(kg) × 时间(小时)
 */
const calculatedCalories = computed(() => {
  if (!duration.value || duration.value <= 0) return 0

  const metValue = selectedPreset.value?.metValue || 5.0 // 默认 MET 值
  const hours = duration.value / 60
  const weight = settings.value.weight || 70

  return Math.round(metValue * weight * hours)
})

/**
 * 是否可以添加
 */
const canAdd = computed(() => {
  if (!duration.value || duration.value <= 0) return false
  if (!selectedPreset.value && !customName.value.trim()) return false
  return true
})

/**
 * 选择预设运动
 */
function selectPreset(preset: ExercisePreset) {
  selectedPreset.value = preset
  showCustomForm.value = false
  customName.value = ''
  duration.value = 30
}

/**
 * 取消选择
 */
function cancelSelection() {
  selectedPreset.value = null
  showCustomForm.value = false
  customName.value = ''
  duration.value = 30
}

/**
 * 添加运动记录
 */
function addExerciseRecord() {
  if (!canAdd.value) return

  const exercise = {
    date: getToday(),
    type: selectedPreset.value?.id || 'custom',
    name: selectedPreset.value?.name || customName.value,
    icon: selectedPreset.value?.icon || '🏃',
    duration: duration.value,
    calories: calculatedCalories.value,
  }

  addExercise(exercise)
  cancelSelection()
}

/**
 * 删除运动记录
 */
function removeExerciseRecord(id: string) {
  if (confirm('确定要删除这条运动记录吗？')) {
    removeExercise(id)
  }
}
</script>
