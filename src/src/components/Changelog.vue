<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-health-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      更新日志
    </h3>

    <div class="space-y-6">
      <div
        v-for="version in versions"
        :key="version.number"
        class="relative pl-6 pb-6 border-l-2 border-gray-200 last:border-0 last:pb-0"
      >
        <!-- 版本节点 -->
        <div class="absolute -left-2 top-0 w-4 h-4 rounded-full bg-health-green"></div>

        <!-- 版本信息 -->
        <div class="mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold text-gray-800">{{ version.number }}</span>
            <span class="px-2 py-0.5 text-xs rounded-full" :class="getVersionBadgeClass(version)">
              {{ version.badge }}
            </span>
          </div>
          <div class="text-xs text-gray-500">{{ version.date }}</div>
        </div>

        <!-- 更新内容 -->
        <div class="space-y-2">
          <div
            v-for="(item, index) in version.changes"
            :key="index"
            class="flex items-start gap-2"
          >
            <Icons :name="getChangeIcon(item.type)" size="sm" class="flex-shrink-0 mt-0.5" :class="getChangeColor(item.type)" />
            <div class="flex-1 text-sm text-gray-700">
              {{ item.text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 更多信息 -->
    <div class="mt-6 pt-4 border-t border-gray-100 text-center">
      <a
        href="https://github.com/Leonn0924/calorie-tracker"
        target="_blank"
        class="text-sm text-health-600 hover:text-health-700"
      >
        查看完整更新记录 →
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icons from '@/components/icons/Icons.vue'

interface ChangeItem {
  type: 'feat' | 'fix' | 'docs' | 'refactor'
  text: string
}

interface Version {
  number: string
  date: string
  badge: '最新' | '稳定' | '早期'
  changes: ChangeItem[]
}

const versions: Version[] = [
  {
    number: 'V1.2.0',
    date: '2026-06-25',
    badge: '最新',
    changes: [
      { type: 'feat', text: '新增体重趋势图（折线图，支持 7 天/30 天/90 天）' },
      { type: 'feat', text: '新增热量摄入趋势图（柱状图 + 预算线）' },
      { type: 'feat', text: '新增目标进度条（进度条 + 里程碑）' },
      { type: 'feat', text: '安装 Chart.js 和 vue-chartjs' },
    ],
  },
  {
    number: 'V1.1.0',
    date: '2026-06-25',
    badge: '稳定',
    changes: [
      { type: 'feat', text: '新增条形码扫码识别功能' },
      { type: 'feat', text: '集成 OpenFoodFacts API 营养数据查询' },
      { type: 'feat', text: '改为拍照识别模式（手动确认）' },
      { type: 'fix', text: '修复体重联动问题' },
      { type: 'fix', text: '优化日期显示格式' },
    ],
  },
  {
    number: 'V1.0.0',
    date: '2026-06-25',
    badge: '稳定',
    changes: [
      { type: 'feat', text: '饮食记录（快速记录/手动输入/食物库）' },
      { type: 'feat', text: '运动记录（16 种预设/自定义运动）' },
      { type: 'feat', text: '热量计算（BMR/TDEE/预算/缺口）' },
      { type: 'feat', text: '体重追踪（记录/变化统计）' },
      { type: 'feat', text: '数据统计（今日概览/缺口趋势/三餐分布）' },
      { type: 'feat', text: '设置（个人信息/目标设置/BMR 公式）' },
      { type: 'feat', text: '数据管理（导出/导入/清除）' },
      { type: 'docs', text: '部署到 GitHub Pages' },
    ],
  },
]

function getVersionBadgeClass(version: Version) {
  switch (version.badge) {
    case '最新':
      return 'bg-health-green text-white'
    case '稳定':
      return 'bg-blue-100 text-blue-700'
    case '早期':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getChangeIcon(type: ChangeItem['type']) {
  switch (type) {
    case 'feat':
      return 'sparkles'
    case 'fix':
      return 'check-circle'
    case 'docs':
      return 'book-open'
    case 'refactor':
      return 'cog'
    default:
      return 'information-circle'
  }
}

function getChangeColor(type: ChangeItem['type']) {
  switch (type) {
    case 'feat':
      return 'text-health-600'
    case 'fix':
      return 'text-green-600'
    case 'docs':
      return 'text-blue-600'
    case 'refactor':
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}
</script>
