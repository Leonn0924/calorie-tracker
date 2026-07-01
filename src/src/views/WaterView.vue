<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white shadow-sm">
      <div class="px-4 py-6">
        <h1 class="text-2xl font-bold text-gray-900">今日饮水</h1>
        <p class="text-sm text-gray-500 mt-1">保持充足水分，促进新陈代谢</p>
      </div>
    </div>

    <div class="px-4 py-6 space-y-6">
      <!-- 进度卡片 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="text-center mb-4">
          <div class="text-4xl font-bold text-health-600">{{ todayStats.total }}</div>
          <div class="text-sm text-gray-500 mt-1">
            已喝 / 目标 {{ todayStats.goal }}ml
          </div>
        </div>

        <!-- 进度条 -->
        <div class="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            class="absolute left-0 top-0 h-full bg-gradient-to-r from-health-green to-health-green-dark transition-all duration-500"
            :style="{ width: `${todayStats.progress}%` }"
          ></div>
        </div>
        <div class="text-center text-sm text-gray-600">
          进度 {{ todayStats.progress }}%
        </div>

        <!-- 水杯可视化 -->
        <div class="flex justify-center gap-1 mt-4 flex-wrap">
          <span
            v-for="i in 8"
            :key="i"
            class="text-2xl"
            :class="i * 250 <= todayStats.total ? 'opacity-100' : 'opacity-20'"
          >
            💧
          </span>
        </div>
      </div>

      <!-- 快速添加 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">快速添加</h3>
        <div class="grid grid-cols-4 gap-3">
          <button
            @click="handleQuickAdd(200)"
            class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="text-lg font-medium text-gray-800">200ml</div>
            <div class="text-xs text-gray-500">一杯水</div>
          </button>
          <button
            @click="handleQuickAdd(300)"
            class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="text-lg font-medium text-gray-800">300ml</div>
            <div class="text-xs text-gray-500">小瓶水</div>
          </button>
          <button
            @click="handleQuickAdd(500)"
            class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="text-lg font-medium text-gray-800">500ml</div>
            <div class="text-xs text-gray-500">标准瓶</div>
          </button>
          <button
            @click="showCustomInput = true"
            class="p-3 bg-health-50 rounded-lg hover:bg-health-100 transition-colors"
          >
            <div class="text-lg font-medium text-health-600">自定义</div>
            <div class="text-xs text-health-500">其他水量</div>
          </button>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">历史记录</h3>
          <button
            v-if="todayStats.records.length > 0"
            @click="handleClearToday"
            class="text-xs text-red-600 hover:text-red-700"
          >
            清空今日
          </button>
        </div>

        <div v-if="todayStats.records.length > 0" class="space-y-2">
          <div
            v-for="record in todayStats.records"
            :key="record.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">💧</span>
              <div>
                <div class="font-medium text-gray-800">{{ record.amount }}ml</div>
                <div class="text-xs text-gray-500">{{ record.time }}</div>
              </div>
            </div>
            <button
              @click="handleRemove(record.id)"
              class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-400">
          <div class="text-4xl mb-2 opacity-50">💧</div>
          <p class="text-sm">今天还没有喝水记录</p>
          <p class="text-xs mt-1">点击上方按钮快速添加</p>
        </div>
      </div>
    </div>

    <!-- 自定义水量弹窗 -->
    <div
      v-if="showCustomInput"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="showCustomInput = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">自定义水量</h3>
        <input
          v-model.number="customAmount"
          type="number"
          min="50"
          max="2000"
          step="50"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500 mb-4"
          placeholder="输入水量（ml）"
        />
        <div class="flex gap-2">
          <button
            @click="showCustomInput = false"
            class="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleCustomAdd"
            :disabled="!customAmount || customAmount <= 0"
            class="flex-1 py-2 bg-health-green text-white rounded-lg hover:bg-health-green-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWater } from '@/composables/useWater'

const { todayStats, addWater, removeWater, clearToday } = useWater()

const showCustomInput = ref(false)
const customAmount = ref<number>(300)

function handleQuickAdd(amount: number) {
  addWater(amount)
}

function handleCustomAdd() {
  if (customAmount.value && customAmount.value > 0) {
    addWater(customAmount.value)
    showCustomInput.value = false
    customAmount.value = 300
  }
}

function handleRemove(id: string) {
  if (confirm('确定要删除这条记录吗？')) {
    removeWater(id)
  }
}

function handleClearToday() {
  if (confirm('确定要清空今日所有喝水记录吗？')) {
    clearToday()
  }
}
</script>
