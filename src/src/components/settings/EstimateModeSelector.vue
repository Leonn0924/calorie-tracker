<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">估算模式</h3>

    <div class="space-y-3">
      <label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" :class="modelValue === 'rule' ? 'border-health-500 bg-health-50' : 'border-gray-200'">
        <input
          v-model="selectedMode"
          type="radio"
          value="rule"
          class="mt-1 w-4 h-4 text-health-600"
          @change="handleChange"
        />
        <div class="flex-1">
          <div class="font-medium text-gray-800">规则引擎模式</div>
          <div class="text-sm text-gray-500 mt-1">
            基于食物库和规则匹配进行估算，无需 API 调用，离线可用
          </div>
        </div>
      </label>

      <label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" :class="modelValue === 'llm' ? 'border-health-500 bg-health-50' : 'border-gray-200'">
        <input
          v-model="selectedMode"
          type="radio"
          value="llm"
          class="mt-1 w-4 h-4 text-health-600"
          @change="handleChange"
        />
        <div class="flex-1">
          <div class="font-medium text-gray-800">大模型模式</div>
          <div class="text-sm text-gray-500 mt-1">
            使用大语言模型进行智能估算，需要配置 API，准确度更高
          </div>
        </div>
      </label>

      <label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" :class="modelValue === 'hybrid' ? 'border-health-500 bg-health-50' : 'border-gray-200'">
        <input
          v-model="selectedMode"
          type="radio"
          value="hybrid"
          class="mt-1 w-4 h-4 text-health-600"
          @change="handleChange"
        />
        <div class="flex-1">
          <div class="font-medium text-gray-800">混合模式（推荐）</div>
          <div class="text-sm text-gray-500 mt-1">
            优先使用规则引擎，无法识别时调用大模型，兼顾速度和准确度
          </div>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { EstimateMode } from '@/types'
import { useSettings } from '@/composables/useSettings'

const { updateEstimateMode } = useSettings()

const props = defineProps<{
  modelValue: EstimateMode
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EstimateMode]
}>()

const selectedMode = ref<EstimateMode>(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  selectedMode.value = newValue
})

function handleChange() {
  emit('update:modelValue', selectedMode.value)
  updateEstimateMode(selectedMode.value)
}
</script>
