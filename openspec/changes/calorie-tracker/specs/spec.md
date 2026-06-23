# 饮食记录 — OpenSpec 规格

**ID**: spec-meal-record  
**Capability**: 饮食记录  
**Change**: calorie-tracker  
**优先级**: P0  
**版本**: v1.0

---

## 1. 概述

用户通过 AI 智能描述或快捷搜索两种方式记录每日饮食，系统按餐别（早餐/午餐/晚餐/加餐）组织展示，并实时计算当日热量缺口状态。

---

## 2. 前置条件

- 用户已完成个人信息设置（性别/身高/体重/年龄/活动系数）
- 系统已计算出 BMR / TDEE / 每日预算

---

## 3. 功能规格

### 3.1 AI 智能描述记录

| 项目 | 说明 |
|------|------|
| **ID** | F-MR-01 |
| **输入** | 用户自然语言描述（如"中午吃了碗兰州牛肉面，加了个卤蛋"） |
| **处理** | 调用 AI 估算引擎 → 拆分为多个食物条目 → 匹配食物库 → 计算热量 |
| **输出** | 结果预览卡片（食物名 + 克数 + 热量 + 置信度 + 餐别） |
| **确认** | 用户确认后 → 生成多条 MealRecord，source='ai' |

#### 验收标准

- [AC-MR-01] 用户输入描述文本，点击"AI 估算"后展示结果卡片
- [AC-MR-02] 结果卡片正确拆分多条食物（如牛肉面+卤蛋）
- [AC-MR-03] 每条食物显示名称、估算克数、热量和置信度
- [AC-MR-04] 合计热量正确
- [AC-MR-05] 用户可"微调"修改任意条目（换食物/改克数/改餐别）
- [AC-MR-06] 用户点击"确认记录"后，食物条目写入当日记录
- [AC-MR-07] 确认后，今日缺口状态立即更新

### 3.2 快捷记录

| 项目 | 说明 |
|------|------|
| **ID** | F-MR-02 |
| **输入** | 搜索关键词 + 克数 |
| **处理** | 模糊搜索食物库 → 用户选择食物 → 输入克数 → 自动计算热量 |
| **输出** | 单条 MealRecord，source='manual' |

#### 验收标准

- [AC-MR-08] 输入关键词 200ms 内展示搜索结果列表
- [AC-MR-09] 搜索结果按相关度排序，显示名称+分类+每100g热量
- [AC-MR-10] 点击食物后弹出克数输入框
- [AC-MR-11] 确认后自动计算热量并记录

### 3.3 三餐组织

| 项目 | 说明 |
|------|------|
| **ID** | F-MR-03 |
| **分类** | 早餐 / 午餐 / 晚餐 / 加餐 |
| **默认时段** | 早餐 00:00-10:59 / 午餐 11:00-13:59 / 晚餐 14:00-17:59 / 加餐 18:00-23:59 |
| **手动覆写** | 用户可手动更改条目餐别 |

#### 验收标准

- [AC-MR-12] 每条记录归属正确餐别（按记录时间或用户指定）
- [AC-MR-13] 按餐别分组展示，每组显示该餐小计热量
- [AC-MR-14] 用户可修改条目餐别

### 3.4 编辑与删除

| 项目 | 说明 |
|------|------|
| **ID** | F-MR-04 |
| **操作** | 修改克数 / 修改食物 / 删除条目 |

#### 验收标准

- [AC-MR-15] 点击条目可修改克数，修改后热量立即重新计算
- [AC-MR-16] 点击删除按钮，确认后移除条目
- [AC-MR-17] 增删改后今日缺口状态立即更新

### 3.5 今日缺口展示

| 项目 | 说明 |
|------|------|
| **ID** | F-MR-05 |
| **指标** | 预算摄入量 / 已摄入合计 / 剩余可吃 / 缺口状态 |
| **状态颜色** | 🟢 在缺口内 (已摄入 ≤ 预算) / 🟡 接近上限 (预算 < 已摄入 ≤ TDEE) / 🔴 超支 (已摄入 > TDEE) |

#### 验收标准

- [AC-MR-18] 页面始终展示今日缺口概览（预算/已摄入/剩余）
- [AC-MR-19] 缺口状态颜色正确（绿/黄/红）
- [AC-MR-20] 进度环形图显示已摄入占预算比例
- [AC-MR-21] 有记录时直接展示数据，无记录时显示"今天还没吃东西"

---

## 4. 数据模型

```typescript
interface MealRecord {
  id: string                 // UUID
  date: string               // 日期 YYYY-MM-DD
  mealType: MealType         // 早餐/午餐/晚餐/加餐

  foodId: string             // 关联食物ID
  foodName: string           // 记录时的食物名称（快照）
  caloriesPer100g: number    // 记录时的热量数据（快照）
  grams: number              // 克数
  calories: number           // 计算后热量

  source: 'ai' | 'manual'
  confidence?: 'high' | 'medium' | 'low'  // AI 记录时必填
  rawInput?: string          // AI 记录时保留原始描述

  createdAt: string          // ISO
}
```

---

## 5. 边界条件

| 场景 | 处理 |
|------|------|
| 空输入 | 按钮禁用，提示"请描述你吃了什么" |
| 无匹配食物 | 标记"未知食物"，提示用户手动选择 |
| 重复提交 | 以最后一次确认结果为准（覆盖） |
| 同食物同日多次 | 每条独立记录，不做合并 |
| 跨日记录 | 记录日期以用户选择的日期为准（默认今日） |

---

## 6. 错误状态

| 错误 | 提示 | 处理方式 |
|------|------|---------|
| AI 估算失败 | "AI 估算失败，已切换为手动搜索" | 自动降级 |
| API 超时 | "大模型请求超时，请检查网络或重试" | 降级规则引擎 |
| LocalStorage 写入失败 | "存储空间不足，建议备份数据" | 提示用户清理 |

---

## 7. 加载状态

| 状态 | 表现 |
|------|------|
| AI 估算中 | "🤖 正在智能分析..." 骨架屏 |
| 搜索中 | 延迟 200ms 后展示加载指示器 |
| 提交中 | 按钮变为"添加中..." 并禁用 |

---

# 食物库 — OpenSpec 规格

**ID**: spec-food-library  
**Capability**: 食物库  
**Change**: calorie-tracker  
**优先级**: P0  
**版本**: v1.0

---

## 1. 概述

提供内置基础食物库供用户快捷记录使用，同时支持用户自定义添加食物。搜索和分类浏览双模式。

---

## 2. 功能规格

### 2.1 内置基础食物库

| 项目 | 说明 |
|------|------|
| **ID** | F-FL-01 |
| **数量** | 首批 20+ 常见食物（见表），后续版本扩展至 200+ |
| **分类** | 主食、肉类、蔬菜、水果、饮品、零食 |
| **存储** | 静态文件，随版本发布 |
| **不可编辑** | 内置食物不可修改或删除 |

### 2.2 搜索

| 项目 | 说明 |
|------|------|
| **ID** | F-FL-02 |
| **匹配** | 名称模糊匹配（子串包含） |
| **排序** | 完全匹配 > 前缀匹配 > 子串包含 |
| **响应** | 输入后 200ms 内展示结果 |
| **空结果** | 显示"未找到，可新增自定义食物" |

### 2.3 自定义食物

| 项目 | 说明 |
|------|------|
| **ID** | F-FL-03 |
| **字段** | 名称、分类、每100g热量、常用单位 |
| **存储** | LocalStorage |
| **查库优先级** | 先查自定义库 → 再查内置库 |
| **去重** | 同名称不可重复添加 |

---

## 3. 数据模型

```typescript
interface FoodItem {
  id: string
  name: string
  category: FoodCategory     // 主食/肉类/蔬菜/水果/饮品/零食/调味品/其他
  caloriesPer100g: number
  unit: 'g' | 'ml'
  isCustom: boolean
  createdAt: string          // ISO
}
```

---

## 4. 边界条件

| 场景 | 处理 |
|------|------|
| 自定义食物重名 | 提示"该食物已存在" |
| 热量输入非数字 | 输入框 type=number 限制 |
| 超高热量（>900） | 提示"请确认热量数据是否正确" |

---

# AI 估算引擎 — OpenSpec 规格

**ID**: spec-ai-engine  
**Capability**: AI 估算引擎  
**Change**: calorie-tracker  
**优先级**: P0  
**版本**: v1.0

---

## 1. 概述

三种估算模式：规则引擎（默认离线）、大模型模式（需 API）、混合模式（推荐）。核心功能是将用户自然语言描述拆分为独立食物条目并估算热量。

---

## 2. 功能规格

### 2.1 规则引擎

| 项目 | 说明 |
|------|------|
| **ID** | F-AI-01 |
| **拆分** | 中文关键词：逗号、顿号、"和"、"还"、"加" 等 |
| **餐别推断** | 含"早"→早餐，"午/中"→午餐，"晚"→晚餐，其余→根据时段推断 |
| **标准份量** | 内置份量表（一碗面400g、一个鸡蛋60g 等） |
| **食物匹配** | 关键词匹配食物库，匹配不到标记"未知食物" |
| **置信度** | 全部标记 'medium' |
| **模糊表述** | "一些""一点" → 标准份量的 50%，标 'low' |

#### 标准份量参考表

| 食物 | 标准份量 |
|------|---------|
| 米饭/面条 | 一碗 ≈ 400g |
| 馒头/包子 | 一个 ≈ 80-100g |
| 鸡蛋 | 一个 ≈ 60g |
| 肉类（块状） | 一份 ≈ 100-150g |
| 蔬菜（熟） | 一份 ≈ 150-200g |
| 饮品（杯） | 一杯 ≈ 250-330ml |
| 水果 | 一个 ≈ 200g |
| 汤/粥 | 一碗 ≈ 300ml |

### 2.2 大模型模式

| 项目 | 说明 |
|------|------|
| **ID** | F-AI-02 |
| **协议** | OpenAI Chat Completions 兼容 API |
| **输入** | system prompt + 用户描述 |
| **输出** | 结构化 JSON（foodName, grams, confidence, note） |
| **超时** | 10 秒 |
| **失败降级** | → 规则引擎 |
| **max_tokens** | 512 |

### 2.3 混合模式

| 项目 | 说明 |
|------|------|
| **ID** | F-AI-03 |
| **流程** | 规则引擎先跑 → 低置信度/未知食物 → LLM 兜底 → 合并结果 |

---

## 3. Prompt 模板

```json
{
  "system": "你是一个食物热量估算助手。用户会描述一餐吃了什么，你需要：
  1. 将描述拆分为多个独立食物条目
  2. 推断每项食物的克数（基于标准份量常识）
  3. 匹配食物名称（精确匹配，不要编造）
  4. 返回结构化 JSON

  输出格式要求（仅返回 JSON，不要多余文字）：
  {
    \"mealType\": \"早餐|午餐|晚餐|加餐\",
    \"items\": [
      {
        \"foodName\": \"食物名称\",
        \"grams\": 克数,
        \"confidence\": \"high|medium|low\",
        \"note\": \"备注（如有特殊说明）\"
      }
    ]
  }

  注意事项：
  - 克数基于中国常见餐饮标准份量估算
  - 如不确定可标注 confidence: low
  - 不要编造食物名称",
  "user": "{用户输入}"
}
```

---

## 4. 数据模型

```typescript
interface AIEstimateItem {
  foodName: string
  grams: number
  calories: number
  confidence: 'high' | 'medium' | 'low'
}

interface EstimateResult {
  mealType: MealType
  items: AIEstimateItem[]
  totalCalories: number
}

type EstimateMode = 'rule' | 'llm' | 'hybrid'
```

---

## 5. 边界条件

| 场景 | 处理 |
|------|------|
| 空描述 | "请描述你吃了什么" |
| 单食物 | 正常返回单条结果 |
| 无匹配 | "未知食物，请手动选择或新增" |
| API 返回非 JSON | 解析失败 → 规则引擎降级 |
| API 返回空 items | 标记为失败 → 规则引擎 |
| 大段文字（>100字） | 限制输入长度，提示"请精简描述" |

---

# 数据统计 — OpenSpec 规格

**ID**: spec-stats  
**Capability**: 数据统计  
**Change**: calorie-tracker  
**优先级**: P0 (今日缺口) / P1 (七日趋势 / 达成率)  
**版本**: v1.0

---

## 1. 概述

提供今日缺口状态、三餐热量分布、七日趋势、达成率统计等可视化数据。

---

## 2. 功能规格

### 2.1 今日缺口

| 项目 | 说明 |
|------|------|
| **ID** | F-ST-01 |
| **展示** | 预算 / 已摄入 / 剩余 + 缺口状态（绿/黄/红） |
| **无记录时** | 预算=2,282 / 已摄入=0 / 剩余=2,282 / 状态=在缺口内 |

### 2.2 缺口状态判定

```typescript
if (totalIntake <= dailyBudget)  → 'in_deficit'   // 🟢
if (totalIntake <= tdee)         → 'near_limit'    // 🟡
else                              → 'over_budget'   // 🔴
```

### 2.3 三餐热量分布 (P0)
- 饼图：早餐/午餐/晚餐/加餐 各占比
- 按日统计

### 2.4 七日缺口趋势 (P1)
- 柱状图：每日摄入 vs 预算 vs TDEE
- 颜色标识每日状态

### 2.5 达成率统计 (P1)
- 周达成率 = 本周达标天数 / 7
- 月达成率 = 本月达标天数 / 本月已过天数

---

# 设置 — OpenSpec 规格

**ID**: spec-settings  
**Capability**: 设置  
**Change**: calorie-tracker  
**优先级**: P0  
**版本**: v1.0

---

## 1. 概述

个人信息录入、减重目标设定、BMR/TDEE/预算自动计算、大模型 API 配置。

---

## 2. 功能规格

### 2.1 个人信息 (P0)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 性别 | male/female | ✅ | 影响 BMR 公式 |
| 身高 | cm | ✅ | — |
| 体重 | kg | ✅ | 当前体重 |
| 年龄 | 岁 | ✅ | — |
| 活动系数 | 1-5 | ✅ | 影响 TDEE |

### 2.2 BMR 计算

```typescript
function bmr(gender, weight, height, age): number {
  if (gender === 'male')
    return 10*weight + 6.25*height - 5*age + 5
  else
    return 10*weight + 6.25*height - 5*age - 161
}
```

### 2.3 目标设置 (P0)

| 模式 | 计算方式 |
|------|---------|
| 目标模式 | 总减重 × 7700 ÷ 天数 |
| 高级模式 | 直接填写每日缺口 |
| 维持模式 | 缺口=0 |
| 增肌模式 | 总增重 × 7700 ÷ 天数（盈余） |

### 2.4 自动计算结果展示

| 字段 | 计算 | 写权限 |
|------|------|--------|
| BMR | Mifflin-St Jeor 公式 | 只读 |
| TDEE | BMR × 活动系数 | 只读 |
| 每日预算 | TDEE − 目标缺口 | 只读 |
| 目标缺口 | 目标模式/高级模式 | 模式决定 |

### 2.5 安全校验

| 校验 | 规则 |
|------|------|
| 预算过低 | 预算 < BMR × 0.8 → 警告 |
| 缺口过大 | |缺口| > 1000 → 警告 |

### 2.6 大模型 API 配置 (P0)

| 字段 | 类型 | 说明 |
|------|------|------|
| apiEndpoint | string | API 地址 |
| apiKey | string | 密文存储/遮盖显示 |
| modelName | string | 模型名称 |
| estimateMode | rule/llm/hybrid | 估算模式 |

### 2.7 体重记录 (P1)

| 项目 | 说明 |
|------|------|
| **ID** | F-ST-05 |
| **输入** | 日期 + 体重 |
| **展示** | 历史记录列表 |
| **图表** | 折线图（与缺口趋势对照，P1） |

---

## 3. 数据模型

```typescript
interface UserSettings {
  gender: 'male' | 'female'
  height: number       // cm
  weight: number       // kg
  age: number
  goalMode: 'target' | 'advanced' | 'maintain' | 'bulk'
  targetWeight?: number
  targetDays?: number
  activityLevel: 1 | 2 | 3 | 4 | 5
  targetDeficit: number

  // read-only computed
  bmr: number
  tdee: number
  dailyBudget: number
}

interface LLMConfig {
  apiEndpoint: string
  apiKey: string
  modelName: string
  mode: 'rule' | 'llm' | 'hybrid'
  timeoutMs: number
  maxTokens: number
}

interface WeightRecord {
  id: string
  date: string     // YYYY-MM-DD
  weight: number   // kg
  createdAt: string
}
```

---

# 通用规格

## 枚举定义

```typescript
type FoodCategory = '主食' | '肉类' | '蔬菜' | '水果' | '饮品' | '零食' | '调味品' | '其他'
type MealType = '早餐' | '午餐' | '晚餐' | '加餐'
type ActivityLevel = 1 | 2 | 3 | 4 | 5
type DeficitStatus = 'in_deficit' | 'near_limit' | 'over_budget'
type GoalMode = 'target' | 'advanced' | 'maintain' | 'bulk'
type EstimateMode = 'rule' | 'llm' | 'hybrid'
type RecordSource = 'ai' | 'manual'
type Confidence = 'high' | 'medium' | 'low'
```

## 存储方案

- LocalStorage Key 命名: `calorie-tracker.settings`, `calorie-tracker.meals`, `calorie-tracker.foods`, `calorie-tracker.weights`
- 使用 lz-string 压缩存储
- 数据迁移: 版本号 + 升级脚本

## 非功能需求

| 项目 | 要求 |
|------|------|
| 页面加载 | 首次 < 2s, 后续 < 0.5s |
| 食物搜索 | 200ms 内 |
| 记录保存 | 即时 < 100ms |
| 离线 | 100% 离线可用（LLM 需要网络） |
| 浏览器 | Chrome/Edge/Safari 最新 2 版本 |
---

# 运动消耗 — OpenSpec 规格

**ID**: spec-exercise  
**Capability**: 运动消耗  
**Change**: calorie-tracker  
**优先级**: P0  
**版本**: v1.0

---

## 1. 概述

用户记录每日运动消耗，系统将其纳入热量缺口计算。提供常见运动快捷记录和自定义运动记录。

---

## 2. 功能规格

### 2.1 运动快捷记录

| 项目 | 说明 |
|------|------|
| **ID** | F-EX-01 |
| **预设运动** | 跑步/游泳/力量训练/骑行/瑜伽/球类运动 等 |
| **输入** | 选择运动类型 + 时长（分钟） |
| **计算** | 基于 MET 值 × 体重 × 时长 计算消耗 |
| **输出** | 单条 ExerciseRecord |

#### 验收标准

- [AC-EX-01] 展示常见运动快捷按钮（带图标）
- [AC-EX-02] 点击运动类型后弹出时长输入框
- [AC-EX-03] 输入时长后自动计算消耗热量
- [AC-EX-04] 确认后写入当日运动记录

### 2.2 自定义运动

| 项目 | 说明 |
|------|------|
| **ID** | F-EX-02 |
| **输入** | 运动名称 + 消耗热量（手动填写） |
| **适用** | 预设列表中没有的运动 |

### 2.3 运动日志

| 项目 | 说明 |
|------|------|
| **ID** | F-EX-03 |
| **展示** | 今日运动记录列表（运动名 + 时长 + 消耗） |
| **合计** | 显示今日运动总消耗 |
| **删除** | 支持删除运动记录 |

### 2.4 缺口计算更新

| 项目 | 说明 |
|------|------|
| **ID** | F-EX-04 |
| **公式** | 净缺口 = 预算 + 运动消耗 - 已摄入 |
| **更新** | 运动记录增删后立即更新缺口状态 |

---

## 3. 数据模型

```typescript
interface ExerciseRecord {
  id: string
  date: string              // YYYY-MM-DD
  type: string              // 运动类型（跑步/游泳等）
  icon: string              // 图标 emoji
  duration: number          // 时长（分钟）
  calories: number          // 消耗热量（千卡）
  source: 'preset' | 'custom'
  createdAt: string         // ISO
}

interface ExercisePreset {
  name: string
  icon: string
  metValue: number          // MET 值（代谢当量）
}
```

---

## 4. MET 值参考表

| 运动 | MET 值 |
|------|--------|
| 跑步（8km/h） | 8.0 |
| 游泳（中等强度） | 6.0 |
| 力量训练 | 5.0 |
| 骑行（中等强度） | 6.0 |
| 瑜伽 | 2.5 |
| 球类运动 | 5.0 |
| 快走（6km/h） | 3.5 |
| 跳绳 | 10.0 |

**消耗计算公式**: `calories = MET × weight(kg) × duration(hours)`

---

# 体重追踪 — OpenSpec 规格

**ID**: spec-weight-tracking  
**Capability**: 体重追踪  
**Change**: calorie-tracker  
**优先级**: P0  
**版本**: v1.0

---

## 1. 概述

用户记录每日体重，系统展示体重趋势图并计算变化率。与缺口数据对照，验证减脂效果。

---

## 2. 功能规格

### 2.1 体重记录

| 项目 | 说明 |
|------|------|
| **ID** | F-WT-01 |
| **输入** | 日期 + 体重（kg） |
| **默认** | 日期默认今日，体重需手动填写 |
| **精度** | 0.1 kg |
| **校验** | 体重范围 30-300 kg |

#### 验收标准

- [AC-WT-01] 统计页提供"记录体重"按钮
- [AC-WT-02] 点击后弹出输入表单（日期+体重）
- [AC-WT-03] 保存后立即更新体重趋势图
- [AC-WT-04] 同一日期重复记录以最新值为准

### 2.2 体重趋势图

| 项目 | 说明 |
|------|------|
| **ID** | F-WT-02 |
| **展示** | 近 7 日体重折线图 |
| **标注** | 每个数据点显示日期和体重值 |
| **目标线** | 显示目标体重参考线（虚线） |

### 2.3 体重统计

| 项目 | 说明 |
|------|------|
| **ID** | F-WT-03 |
| **本周平均** | 计算本周记录的平均体重 |
| **周变化** | 本周平均 vs 上周平均 |
| **总变化** | 首次记录 vs 最新记录 |

---

## 3. 数据模型

```typescript
interface WeightRecord {
  id: string
  date: string     // YYYY-MM-DD
  weight: number   // kg
  createdAt: string
}
```

**注意**: 此模型已在 spec-settings 中定义，此处复用。

---

## 4. 边界条件

| 场景 | 处理 |
|------|------|
| 无记录 | 显示"暂无体重数据" + 引导记录 |
| 只有 1 条记录 | 趋势图显示单点，周变化显示"—" |
| 体重异常跳变 | 如单日变化 >2kg，提示确认 |
| 跨月记录 | 月视图按周汇总 |

---

# 通用规格（更新）

## 枚举定义（新增）

```typescript
type ExerciseSource = 'preset' | 'custom'
```

## 缺口公式更新

```typescript
// 旧公式
deficit = dailyBudget - totalIntake

// 新公式（v1.0）
netDeficit = dailyBudget + exerciseCalories - totalIntake
```

## 存储方案（更新）

LocalStorage Key 新增:
- `calorie-tracker.exercises` — 运动记录
- `calorie-tracker.exercise-presets` — 预设运动（只读）
