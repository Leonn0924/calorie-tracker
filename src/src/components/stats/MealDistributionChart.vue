<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">三餐热量分布</h3>

    <div v-if="distribution.total > 0" class="flex items-center gap-6">
      <!-- 饼图 -->
      <div class="relative w-40 h-40">
        <svg viewBox="0 0 100 100" class="transform -rotate-90">
          <circle
            v-if="distribution.percentages.breakfast > 0"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#F59E0B"
            stroke-width="20"
            :stroke-dasharray="`${distribution.percentages.breakfast * 2.51} ${251 - distribution.percentages.breakfast * 2.51}`"
            stroke-dashoffset="0"
          />
          <circle
            v-if="distribution.percentages.lunch > 0"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#10B981"
            stroke-width="20"
            :stroke-dasharray="`${distribution.percentages.lunch * 2.51} ${251 - distribution.percentages.lunch * 2.51}`"
            :stroke-dashoffset="`-${distribution.percentages.breakfast * 2.51}`"
          />
          <circle
            v-if="distribution.percentages.dinner > 0"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#3B82F6"
            stroke-width="20"
            :stroke-dasharray="`${distribution.percentages.dinner * 2.51} ${251 - distribution.percentages.dinner * 2.51}`"
            :stroke-dashoffset="`-${(distribution.percentages.breakfast + distribution.percentages.lunch) * 2.51}`"
          />
          <circle
            v-if="distribution.percentages.snack > 0"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#8B5CF6"
            stroke-width="20"
            :stroke-dasharray="`${distribution.percentages.snack * 2.51} ${251 - distribution.percentages.snack * 2.51}`"
            :stroke-dashoffset="`-${(distribution.percentages.breakfast + distribution.percentages.lunch + distribution.percentages.dinner) * 2.51}`"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ distribution.total }}</div>
            <div class="text-xs text-gray-500">总千卡</div>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="flex-1 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #F59E0B"></div>
            <span class="text-sm text-gray-700">早餐</span>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-gray-800">{{ distribution.breakfast }} kcal</div>
            <div class="text-xs text-gray-500">{{ distribution.percentages.breakfast.toFixed(1) }}%</div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #10B981"></div>
            <span class="text-sm text-gray-700">午餐</span>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-gray-800">{{ distribution.lunch }} kcal</div>
            <div class="text-xs text-gray-500">{{ distribution.percentages.lunch.toFixed(1) }}%</div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #3B82F6"></div>
            <span class="text-sm text-gray-700">晚餐</span>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-gray-800">{{ distribution.dinner }} kcal</div>
            <div class="text-xs text-gray-500">{{ distribution.percentages.dinner.toFixed(1) }}%</div>
          </div>
        </div>

        <div v-if="distribution.snack > 0" class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #8B5CF6"></div>
            <span class="text-sm text-gray-700">加餐</span>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-gray-800">{{ distribution.snack }} kcal</div>
            <div class="text-xs text-gray-500">{{ distribution.percentages.snack.toFixed(1) }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <div class="text-gray-400 text-sm">今日暂无饮食记录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DistributionData {
  breakfast: number
  lunch: number
  dinner: number
  snack: number
  total: number
  percentages: {
    breakfast: number
    lunch: number
    dinner: number
    snack: number
  }
}

defineProps<{
  distribution: DistributionData
}>()
</script>
