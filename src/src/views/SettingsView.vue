<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">设置</h1>
      <p class="text-sm text-gray-500">配置个人信息、目标和 API 设置</p>
    </div>

    <!-- 个人信息 -->
    <ProfileForm />

    <!-- 目标设置 -->
    <GoalSettings />

    <!-- API 配置 -->
    <APIConfig />

    <!-- 体重记录 -->
    <WeightTracker />

    <!-- 数据导出/导入 -->
    <DataExportImport />

    <!-- 更新日志 -->
    <Changelog />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettings } from '@/composables/useSettings'
import ProfileForm from '@/components/settings/ProfileForm.vue'
import GoalSettings from '@/components/settings/GoalSettings.vue'
import APIConfig from '@/components/settings/APIConfig.vue'
import WeightTracker from '@/components/settings/WeightTracker.vue'
import DataExportImport from '@/components/settings/DataExportImport.vue'
import Changelog from '@/components/Changelog.vue'

const { settings } = useSettings()
</script>
