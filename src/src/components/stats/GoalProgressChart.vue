<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">目标进度</h3>

    <div v-if="hasGoal" class="space-y-6">
      <!-- 进度可视化 -->
      <div class="relative">
        <!-- 背景轨道 -->
        <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-health-green to-health-green-dark transition-all duration-500"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>

        <!-- 起点和终点标记 -->
        <div class="relative h-8 mt-2">
          <div class="absolute left-0 top-0">
            <div class="text-xs text-gray-500">开始</div>
            <div class="text-sm font-bold text-gray-800">{{ startWeight }}<span class="text-xs text-gray-500 ml-1">kg</span></div>
          </div>
          <div class="absolute right-0 top-0">
            <div class="text-xs text-gray-500">目标</div>
            <div class="text-sm font-bold text-health-600">{{ targetWeight }}<span class="text-xs text-gray-500 ml-1">kg</span></div>
          </div>
        </div>
      </div>

      <!-- 当前位置标记 -->
      <div class="relative">
        <div class="flex items-center justify-between text-sm">
          <div class="text-gray-500">当前位置</div>
          <div class="font-bold text-gray-800">{{ currentWeight }}<span class="text-xs text-gray-500 ml-1">kg</span></div>
        </div>
      </div>

      <!-- 详细统计 -->
      <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <div class="text-xs text-gray-500 mb-1">已达成</div>
          <div class="text-lg font-bold text-health-600">
            {{ lostWeight.toFixed(1) }}
            <span class="text-xs text-gray-500 ml-1">kg</span>
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">剩余</div>
          <div class="text-lg font-bold text-gray-800">
            {{ remainingWeight.toFixed(1) }}
            <span class="text-xs text-gray-500 ml-1">kg</span>
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">进度</div>
          <div class="text-lg font-bold text-health-600">
            {{ progressPercentage.toFixed(0) }}
            <span class="text-xs text-gray-500 ml-1">%</span>
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">预计达成</div>
          <div class="text-lg font-bold text-gray-800">
            {{ estimatedDate }}
          </div>
        </div>
      </div>

      <!-- 里程碑 -->
      <div v-if="milestones.length > 0" class="pt-4 border-t border-gray-100">
        <div class="text-xs text-gray-500 mb-2">已达成里程碑</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="milestone in milestones"
            :key="milestone.weight"
            class="px-2 py-1 bg-health-50 text-health-700 text-xs rounded-md"
          >
            {{ milestone.weight }}kg
          </span>
        </div>
      </div>
    </div>

    <!-- 无目标状态 -->
    <div v-else class="py-8 text-center text-gray-400">
      <Icons name="target" size="xl" class="mx-auto mb-2 opacity-50" />
      <p class="text-sm">尚未设置目标</p>
      <p class="text-xs mt-1">在设置中配置目标体重</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWeight } from '@/composables/useWeight'
import { useSettings } from '@/composables/useSettings'
import Icons from '@/components/icons/Icons.vue'

const { sortedWeights } = useWeight()
const { settings } = useSettings()

const hasGoal = computed(() => settings.value.targetWeight && settings.value.targetWeight !== settings.value.weight)

const startWeight = computed(() => {
  if (sortedWeights.value.length === 0) return settings.value.weight
  return sortedWeights.value[0].weight
})

const currentWeight = computed(() => {
  if (sortedWeights.value.length === 0) return settings.value.weight
  return sortedWeights.value[sortedWeights.value.length - 1].weight
})

const targetWeight = computed(() => settings.value.targetWeight || currentWeight.value)

const lostWeight = computed(() => {
  if (startWeight.value > targetWeight.value) {
    // 减重模式
    return Math.max(0, startWeight.value - currentWeight.value)
  } else {
    // 增重模式
    return Math.max(0, currentWeight.value - startWeight.value)
  }
})

const remainingWeight = computed(() => {
  return Math.abs(currentWeight.value - targetWeight.value)
})

const totalGoal = computed(() => {
  return Math.abs(startWeight.value - targetWeight.value)
})

const progressPercentage = computed(() => {
  if (totalGoal.value === 0) return 0
  return Math.min(100, Math.max(0, (lostWeight.value / totalGoal.value) * 100))
})

const estimatedDate = computed(() => {
  if (sortedWeights.value.length < 2) return '-'

  const weights = sortedWeights.value
  const first = weights[0]
  const last = weights[weights.length - 1]

  const daysDiff = Math.ceil((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24))
  const weightDiff = Math.abs(last.weight - first.weight)

  if (daysDiff === 0 || weightDiff === 0) return '-'

  const dailyRate = weightDiff / daysDiff
  const remainingDays = Math.ceil(remainingWeight.value / dailyRate)

  const estimated = new Date()
  estimated.setDate(estimated.getDate() + remainingDays)

  return `${estimated.getMonth() + 1}/${estimated.getDate()}`
})

const milestones = computed(() => {
  if (sortedWeights.value.length === 0) return []

  const milestones: { weight: number }[] = []
  const target = targetWeight.value
  const start = startWeight.value

  // 计算里程碑（每 1kg 或每 5% 进度）
  const step = totalGoal.value > 10 ? 1 : 0.5
  let milestoneWeight = start

  while (
    (start > target ? milestoneWeight > target : milestoneWeight < target)
  ) {
    milestoneWeight = start > target ? milestoneWeight - step : milestoneWeight + step
    const passed = sortedWeights.value.some(w =>
      start > target ? w.weight <= milestoneWeight : w.weight >= milestoneWeight
    )
    if (passed && !milestones.find(m => m.weight === milestoneWeight)) {
      milestones.push({ weight: milestoneWeight })
    }
  }

  return milestones.slice(0, 5) // 最多显示 5 个
})
</script>
