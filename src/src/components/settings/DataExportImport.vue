<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
      数据管理
    </h3>

    <div class="space-y-4">
      <!-- 导出数据 -->
      <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 class="font-medium text-blue-800 mb-2">导出数据</h4>
        <p class="text-sm text-blue-700 mb-3">将所有数据导出为 JSON 文件，可用于备份或迁移</p>
        <button
          @click="exportData"
          class="px-4 py-2 bg-health-green text-white rounded-lg hover:bg-health-green-dark transition-colors"
        >
          下载数据文件
        </button>
      </div>

      <!-- 导入数据 -->
      <div class="p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 class="font-medium text-green-800 mb-2">导入数据</h4>
        <p class="text-sm text-green-700 mb-3">从 JSON 文件恢复数据，会覆盖当前数据</p>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          @click="$refs.fileInput.click()"
          class="px-4 py-2 bg-health-green text-white rounded-lg hover:bg-health-green-dark transition-colors"
        >
          选择文件导入
        </button>
      </div>

      <!-- 清除数据 -->
      <div class="p-4 bg-red-50 rounded-lg border border-red-200">
        <h4 class="font-medium text-red-800 mb-2">清除数据</h4>
        <p class="text-sm text-red-700 mb-3">删除所有本地数据，此操作不可恢复</p>
        <button
          @click="clearData"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          清除所有数据
        </button>
      </div>

      <!-- 数据概览 -->
      <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 class="font-medium text-gray-800 mb-2">数据概览</h4>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div class="text-gray-500">饮食记录</div>
            <div class="text-xl font-bold text-gray-800">{{ stats.meals }}</div>
            <div class="text-xs text-gray-400">条</div>
          </div>
          <div>
            <div class="text-gray-500">运动记录</div>
            <div class="text-xl font-bold text-gray-800">{{ stats.exercises }}</div>
            <div class="text-xs text-gray-400">条</div>
          </div>
          <div>
            <div class="text-gray-500">体重记录</div>
            <div class="text-xl font-bold text-gray-800">{{ stats.weights }}</div>
            <div class="text-xs text-gray-400">条</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功/错误提示 -->
    <div v-if="message" class="mt-4 p-3 rounded-lg" :class="message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
      <div class="flex items-center gap-2">
        <Icons v-if="message.type === 'success'" name="check-circle" size="md" class="text-green-600" />
        <Icons v-else name="x-circle" size="md" class="text-red-600" />
        <span class="text-sm" :class="message.type === 'success' ? 'text-green-700' : 'text-red-700'">
          {{ message.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import Icons from '@/components/icons/Icons.vue'

const fileInput = ref<HTMLInputElement | null>(null)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// 数据统计
const stats = computed(() => {
  const meals = storage.get<any[]>('meals') || []
  const exercises = storage.get<any[]>('exercises') || []
  const weights = storage.get<any[]>('weights') || []

  return {
    meals: meals.length,
    exercises: exercises.length,
    weights: weights.length,
  }
})

// 导出数据
function exportData() {
  try {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings: storage.get('settings'),
      meals: storage.get('meals'),
      exercises: storage.get('exercises'),
      weights: storage.get('weights'),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calorie-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    showMessage('success', '数据已导出！')
  } catch (error) {
    showMessage('error', '导出失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 导入数据
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)

      // 验证数据格式
      if (!data.version || !data.meals) {
        throw new Error('无效的数据文件格式')
      }

      // 确认导入
      if (!confirm(`确定要导入数据吗？这将覆盖当前所有数据。\n\n数据概览：\n- 饮食记录：${data.meals?.length || 0} 条\n- 运动记录：${data.exercises?.length || 0} 条\n- 体重记录：${data.weights?.length || 0} 条`)) {
        return
      }

      // 导入数据
      if (data.settings) storage.set('settings', data.settings)
      if (data.meals) storage.set('meals', data.meals)
      if (data.exercises) storage.set('exercises', data.exercises)
      if (data.weights) storage.set('weights', data.weights)

      showMessage('success', '数据已导入！页面将自动刷新...')

      // 刷新页面
      setTimeout(() => {
        location.reload()
      }, 1500)
    } catch (error) {
      showMessage('error', '导入失败：' + (error instanceof Error ? error.message : '文件格式错误'))
    }
  }

  reader.readAsText(file)

  // 清空 input，允许重复选择同一文件
  input.value = ''
}

// 清除数据
function clearData() {
  if (!confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    return
  }

  if (!confirm('再次确认：真的要删除所有数据吗？')) {
    return
  }

  storage.clear()
  showMessage('success', '数据已清除！页面将自动刷新...')

  setTimeout(() => {
    location.reload()
  }, 1500)
}

// 显示消息
function showMessage(type: 'success' | 'error', text: string) {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 5000)
}
</script>
