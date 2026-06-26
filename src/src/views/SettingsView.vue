<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">设置</h1>
      <p class="text-sm text-gray-500">配置个人信息和目标设置</p>
    </div>

    <!-- 个人信息卡片 -->
    <ProfileCard />

    <!-- 目标设置 -->
    <GoalSettings />

    <!-- 体重记录 -->
    <WeightTracker />

    <!-- 数据导出/导入 -->
    <DataExportImport />

    <!-- 更新日志 -->
    <Changelog />
  </div>
</template>

<script setup lang="ts">
import { useSettings } from '@/composables/useSettings'
import ProfileCard from '@/components/settings/ProfileCard.vue'
import GoalSettings from '@/components/settings/GoalSettings.vue'
import WeightTracker from '@/components/settings/WeightTracker.vue'
import DataExportImport from '@/components/settings/DataExportImport.vue'
import Changelog from '@/components/Changelog.vue'

useSettings()
</script>
