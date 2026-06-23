<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">大模型 API 配置</h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- API 端点 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">API 端点</label>
        <input
          v-model="form.apiEndpoint"
          type="url"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="https://api.openai.com/v1/chat/completions"
        />
      </div>

      <!-- API Key -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
        <div class="relative">
          <input
            v-model="form.apiKey"
            :type="showApiKey ? 'text' : 'password'"
            required
            class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
            placeholder="sk-..."
          />
          <button
            type="button"
            @click="showApiKey = !showApiKey"
            class="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            <svg v-if="showApiKey" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 模型名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">模型名称</label>
        <input
          v-model="form.modelName"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="gpt-4, gpt-3.5-turbo, deepseek-chat, etc."
        />
      </div>

      <!-- 超时时间 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">超时时间（毫秒）</label>
        <input
          v-model.number="form.timeoutMs"
          type="number"
          min="1000"
          max="60000"
          step="1000"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="10000"
        />
      </div>

      <!-- 最大 token 数 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">最大 token 数</label>
        <input
          v-model.number="form.maxTokens"
          type="number"
          min="100"
          max="4000"
          step="100"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
          placeholder="512"
        />
      </div>

      <!-- 测试连接按钮 -->
      <div class="flex gap-2">
        <button
          type="button"
          @click="testConnection"
          :disabled="testing"
          class="flex-1 py-2 border border-health-500 text-health-600 rounded-lg hover:bg-health-50 transition-colors disabled:opacity-50"
        >
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
        <button
          type="submit"
          class="flex-1 py-2 bg-health-500 text-white rounded-lg hover:bg-health-600 transition-colors"
        >
          保存配置
        </button>
      </div>

      <!-- 测试结果 -->
      <div v-if="testResult" class="p-3 rounded-lg" :class="testResult.success ? 'bg-green-50' : 'bg-red-50'">
        <div class="flex items-start gap-2">
          <span v-if="testResult.success" class="text-green-600">✅</span>
          <span v-else class="text-red-600">❌</span>
          <div class="flex-1 text-sm" :class="testResult.success ? 'text-green-700' : 'text-red-700'">
            {{ testResult.message }}
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { testLLMConnection } from '@/utils/llmClient'

const { settings, updateLLMConfig } = useSettings()

const form = ref({
  apiEndpoint: settings.value.llmConfig?.apiEndpoint || '',
  apiKey: settings.value.llmConfig?.apiKey || '',
  modelName: settings.value.llmConfig?.modelName || '',
  timeoutMs: settings.value.llmConfig?.timeoutMs || 10000,
  maxTokens: settings.value.llmConfig?.maxTokens || 512,
})

const showApiKey = ref(false)
const testing = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

async function testConnection() {
  testing.value = true
  testResult.value = null

  try {
    const result = await testLLMConnection({
      apiEndpoint: form.value.apiEndpoint,
      apiKey: form.value.apiKey,
      modelName: form.value.modelName,
      mode: 'llm',
      timeoutMs: form.value.timeoutMs,
      maxTokens: form.value.maxTokens,
      createdAt: new Date().toISOString(),
    })

    if (result.success) {
      testResult.value = {
        success: true,
        message: '连接成功！API 配置有效。',
      }
    } else {
      testResult.value = {
        success: false,
        message: result.error || '连接失败，请检查配置。',
      }
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: `连接错误：${error instanceof Error ? error.message : '未知错误'}`,
    }
  } finally {
    testing.value = false
  }
}

function handleSubmit() {
  updateLLMConfig({
    apiEndpoint: form.value.apiEndpoint,
    apiKey: form.value.apiKey,
    modelName: form.value.modelName,
    mode: 'llm',
    timeoutMs: form.value.timeoutMs,
    maxTokens: form.value.maxTokens,
    createdAt: new Date().toISOString(),
  })
  alert('API 配置已保存')
}
</script>
