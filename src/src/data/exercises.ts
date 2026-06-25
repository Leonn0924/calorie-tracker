import type { ExercisePreset } from '@/types'

/**
 * 预设运动数据（基于 MET 值 - 代谢当量）
 * MET 值表示相对于静息状态的能量消耗倍数
 * 1 MET = 1 kcal/kg/hour
 */
export const exercisePresets: ExercisePreset[] = [
  // 有氧运动
  {
    id: 'walking',
    name: '快走',
    icon: 'walking',
    metValue: 3.5,
    category: '有氧',
  },
  {
    id: 'running',
    name: '跑步',
    icon: 'running',
    metValue: 8.0,
    category: '有氧',
  },
  {
    id: 'cycling',
    name: '骑行',
    icon: 'cycling',
    metValue: 6.0,
    category: '有氧',
  },
  {
    id: 'swimming',
    name: '游泳',
    icon: 'swimming',
    metValue: 7.0,
    category: '有氧',
  },
  {
    id: 'jump-rope',
    name: '跳绳',
    icon: 'bolt',
    metValue: 10.0,
    category: '有氧',
  },
  {
    id: 'dance',
    name: '跳舞',
    icon: 'sparkles',
    metValue: 5.5,
    category: '有氧',
  },

  // 力量训练
  {
    id: 'weight-training',
    name: '力量训练',
    icon: 'dumbbell',
    metValue: 5.0,
    category: '力量',
  },
  {
    id: 'bodyweight',
    name: '自重训练',
    icon: 'cog',
    metValue: 4.0,
    category: '力量',
  },
  {
    id: 'yoga',
    name: '瑜伽',
    icon: 'heart',
    metValue: 2.5,
    category: '柔韧',
  },
  {
    id: 'pilates',
    name: '普拉提',
    icon: 'heart',
    metValue: 3.0,
    category: '柔韧',
  },

  // 球类运动
  {
    id: 'basketball',
    name: '篮球',
    icon: 'circle',
    metValue: 6.5,
    category: '球类',
  },
  {
    id: 'badminton',
    name: '羽毛球',
    icon: 'sparkles',
    metValue: 5.5,
    category: '球类',
  },
  {
    id: 'tennis',
    name: '网球',
    icon: 'circle',
    metValue: 7.0,
    category: '球类',
  },
  {
    id: 'table-tennis',
    name: '乒乓球',
    icon: 'sparkles',
    metValue: 4.0,
    category: '球类',
  },

  // 其他
  {
    id: 'hiking',
    name: '爬山',
    icon: 'mountain',
    metValue: 6.0,
    category: '户外',
  },
  {
    id: 'stairs',
    name: '爬楼梯',
    icon: 'arrow-up',
    metValue: 8.0,
    category: '有氧',
  },
]

/**
 * 根据 ID 获取运动预设
 */
export function getExercisePresetById(id: string): ExercisePreset | undefined {
  return exercisePresets.find(preset => preset.id === id)
}

/**
 * 根据分类获取运动预设
 */
export function getExercisePresetsByCategory(category: string): ExercisePreset[] {
  return exercisePresets.filter(preset => preset.category === category)
}

/**
 * 获取所有运动分类
 */
export function getExerciseCategories(): string[] {
  const categories = new Set(exercisePresets.map(preset => preset.category))
  return Array.from(categories)
}
