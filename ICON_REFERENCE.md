# Heroicons 图标参考文档

## 餐别图标

| 餐别 | Emoji | Heroicon | SVG |
|------|-------|----------|-----|
| 早餐 | 🌅 | SunIcon | 太阳 |
| 午餐 | ☀️ | CloudSunIcon | 晴间多云 |
| 晚餐 | 🌙 | MoonIcon | 月亮 |
| 加餐 | 🍪 | SparklesIcon | 火花（零食） |

## 状态图标

| 状态 | Emoji | Heroicon | 颜色 |
|------|-------|----------|------|
| 成功/达标 | ✅ | CheckCircleIcon | 绿色 |
| 警告/接近 | ⚠️ | ExclamationTriangleIcon | 黄色 |
| 失败/超支 | ❌ | XCircleIcon | 红色 |
| 信息 | ℹ️ | InformationCircleIcon | 蓝色 |

## 功能图标

| 功能 | Emoji | Heroicon |
|------|-------|----------|
| AI 估算 | 🧠 | LightBulbIcon |
| 搜索 | 🔍 | MagnifyingGlassIcon |
| 统计 | 📊 | ChartBarIcon |
| 设置 | ⚙️ | CogIcon |
| 记录 | 📝 | ClipboardIcon |
| 食物库 | 📖 | BookOpenIcon |
| 运动 | 🏃 | BoltIcon |
| 添加 | ➕ | PlusIcon |
| 删除 | 🗑️ | TrashIcon |
| 编辑 | ✏️ | PencilIcon |
| 导出 | 📤 | ArrowDownTrayIcon |
| 导入 | 📥 | ArrowUpTrayIcon |

## 图标规格

- **尺寸**: 24x24（标准）、20x20（小）、16x16（超小）
- **描边**: 2px
- **风格**: Outline（描边风格）
- **颜色**: 使用 Tailwind 颜色类（如 text-health-green）

## 使用示例

```vue
<!-- 成功状态 -->
<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>

<!-- 警告状态 -->
<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
</svg>
```
