<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-gray-50">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-sm z-30">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-health-green to-health-cyan flex items-center justify-center text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div>
          <h1 class="font-bold text-lg text-gray-900">热量缺口管理</h1>
          <p class="text-xs text-gray-400">Calorie Deficit Tracker</p>
        </div>
      </div>

      <!-- Today Summary -->
      <TodaySummary
        :budget="dailyStats.budget"
        :intake="dailyStats.intake"
        :exercise="dailyStats.exercise"
        :netDeficit="dailyStats.netDeficit"
        :tdee="settings.tdee"
        :status="dailyStats.status"
      />

      <!-- Navigation -->
      <nav class="flex-1 px-4 mt-6 space-y-1">
        <TabButton
          v-for="tab in tabs"
          :key="tab.id"
          :active="currentTab === tab.id"
          :icon="tab.icon"
          :label="tab.label"
          @click="currentTab = tab.id"
        />
      </nav>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100">
        <p class="text-xs text-gray-400">v1.0 MVP · 纯前端</p>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-health-green to-health-cyan flex items-center justify-center text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="font-semibold text-sm">热量缺口管理</h1>
        </div>
        <div class="flex items-center gap-1 text-xs text-health-green">
          <span class="w-2 h-2 rounded-full bg-health-green animate-pulse"></span>
          <span>{{ statusText }}</span>
        </div>
      </div>
    </header>

    <!-- Mobile TabBar -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-gray-200 shadow-lg">
      <div class="flex justify-around py-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg"
          :class="currentTab === tab.id ? 'text-health-green' : 'text-gray-400'"
        >
          <component :is="tab.icon" class="w-5 h-5" />
          <span class="text-[10px] font-medium">{{ tab.label }}</span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 lg:pl-80 pb-20 lg:pb-0">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <component :is="currentComponent" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TodaySummary from '@/components/TodaySummary.vue'
import TabButton from '@/components/TabButton.vue'
import RecordView from '@/views/RecordView.vue'
import FoodLibraryView from '@/views/FoodLibraryView.vue'
import StatsView from '@/views/StatsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { useDailyStats } from '@/composables/useDailyStats'
import { useSettings } from '@/composables/useSettings'

const { dailyStats } = useDailyStats()
const { settings } = useSettings()

const currentTab = ref<'record' | 'food' | 'stats' | 'settings'>('record')

const tabs = [
  { id: 'record' as const, label: '记录', icon: 'svg-clipboard' },
  { id: 'food' as const, label: '食物库', icon: 'svg-list' },
  { id: 'stats' as const, label: '统计', icon: 'svg-chart' },
  { id: 'settings' as const, label: '设置', icon: 'svg-settings' },
]

const currentComponent = computed(() => {
  switch (currentTab.value) {
    case 'record': return RecordView
    case 'food': return FoodLibraryView
    case 'stats': return StatsView
    case 'settings': return SettingsView
  }
})

const statusText = computed(() => {
  switch (dailyStats.value.status) {
    case 'in_deficit': return '在缺口内'
    case 'near_limit': return '接近上限'
    case 'over_budget': return '已超支'
  }
})
</script>