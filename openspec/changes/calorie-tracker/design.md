# Design: 热量缺口管理工具

> **Change**: calorie-tracker
> **版本**: v1.0
> **基于**: PRD-热量记录工具.md / proposal.md

---

## 1. 架构概览

```
┌──────────────────────────────────────────────────────┐
│                   用户浏览器                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Vue 3 SPA (Vite)                     │  │
│  │                                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │  页面层      │  │  逻辑层     │  │  数据层      │  │  │
│  │  │  · 记录页    │  │  · useMeals │  │  · localStorage │  │
│  │  │  · 食物库页  │  │  · useFoods │  │  · lz-string  │  │  │
│  │  │  · 统计页    │  │  · useStats │  │  · JSON 存储   │  │  │
│  │  │  · 设置页    │  │  · useCalc  │  │              │  │  │
│  │  └────────────┘  │  · aiEngine │  └────────────┘  │  │
│  │                   │  · llmClient│                   │  │
│  │                   └────────────┘                   │  │
│  │                         │                           │  │
│  └─────────────────────────│───────────────────────────┘  │
│                            │                               │
│                            ▼                               │
│                    ┌──────────────┐                        │
│                    │  LLM API     │ (可选，用户配置)        │
│                    │ (fetch)      │                        │
│                    └──────────────┘                        │
└──────────────────────────────────────────────────────────┘
```

---

## 2. 页面结构

### 2.1 布局

```
桌面端（>768px）:
┌──────────────┬──────────────────────────────┐
│  左侧侧边栏   │         主内容区               │
│  ┌────────┐  │                              │
│  │ Logo   │  │  当前 Tab 内容渲染区域         │
│  │ 今日概览 │  │                              │
│  ├────────┤  │                              │
│  │ 📝记录  │  │                              │
│  │ 📖食物库 │  │                              │
│  │ 📊统计  │  │                              │
│  │ ⚙️设置  │  │                              │
│  └────────┘  │                              │
└──────────────┴──────────────────────────────┘
```

### 2.2 四个 Tab 页

| Tab | 职责 | 子视图 |
|-----|------|--------|
| **记录** | 饮食条目管理 | AI 输入区 / 快捷记录面板 / 三餐条目列表 |
| **食物库** | 食物数据管理 | 搜索/分类浏览 / 自定义新增 / 食物详情 |
| **统计** | 数据可视化 | 今日分布饼图 / 七日趋势折线图 |
| **设置** | 用户配置 | 个人信息 / 目标设置 / API 配置 / 体重记录 |

---

## 3. 数据流

### 3.1 核心数据流

```
用户设置
  ├─ 个人信息（性别/身高/体重/年龄）──┐
  ├─ 活动系数（1-5）──────────────┤
  ├─ 目标模式 + 目标体重 + 目标周期 ──┤
  │                                ▼
  │                    ┌──────────────────────┐
  │                    │  BMR Calculator        │
  │                    │  Mifflin-St Jeor 公式  │
  │                    │  → BMR → TDEE → 预算   │
  │                    └──────────────────────┘
  │                                │
  │                                ▼
  │                    ┌──────────────────────┐
  │                    │  UserSettings          │
  │                    │  (LocalStorage)        │
  │                    └──────────────────────┘
  │                                │
  ▼                                ▼
┌────────────┐          ┌──────────────────────┐
│ 饮食记录     │ ──────→  │  今日缺口状态          │
│ (MealRecord)│          │  已摄入 vs 预算 vs TDEE│
│ LocalStorage│          │  → 绿/黄/红状态        │
└────────────┘          └──────────────────────┘
         │                        │
         ▼                        ▼
┌────────────────┐     ┌──────────────────────┐
│ 统计计算         │     │  缺口趋势图表          │
│ 三餐分布 / 趋势   │     │  日/周/月达成率        │
└────────────────┘     └──────────────────────┘
```

### 3.2 AI 估算数据流

```
用户输入："中午吃了碗牛肉面"
        │
        ▼
┌───────────────────────────────────────┐
│ 估算模式判断 (useAIEngine)             │
│                                       │
│  规则引擎 (默认):                       │
│    → 关键词拆分 → 标准份量 → 食物库匹配  │
│    → 返回 AIEstimateItem[]            │
│                                       │
│  大模型模式:                            │
│    → fetch → LLM API → 解析 JSON      │
│    → 返回 AIEstimateItem[]            │
│                                       │
│  混合模式 (推荐):                       │
│    → 先规则引擎                         │
│    → 低置信度项目 → LLM 兜底             │
│    → 合并结果                          │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 结果预览卡片                            │
│ 食物名 | 估算克数 | 热量 | 置信度        │
│ [确认记录] [微调]                       │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 用户确认 → 生成 MealRecord[]           │
│ (source='ai', confidence, rawInput)   │
└───────────────────────────────────────┘
```

---

## 4. 核心业务逻辑

### 4.1 热量计算

| 步骤 | 公式 | 输入 | 输出 |
|------|------|------|------|
| BMR (男) | 10×W + 6.25×H - 5×A + 5 | 体重(kg)、身高(cm)、年龄 | 基础代谢 |
| BMR (女) | 10×W + 6.25×H - 5×A - 161 | 体重(kg)、身高(cm)、年龄 | 基础代谢 |
| TDEE | BMR × 活动系数 | BMR、活动系数(1.2~1.9) | 每日总消耗 |
| 每日预算 | TDEE - 目标缺口 | TDEE、目标缺口 | 可摄入热量 |
| 缺口状态 | 已摄入 vs 预算 vs TDEE | 当日记录总和 | 绿/黄/红 |

### 4.2 缺口状态判定

```typescript
if (totalIntake <= dailyBudget)       → 'in_deficit'  // 绿色 ✅
if (dailyBudget < totalIntake <= TDEE) → 'near_limit'   // 黄色 ⚠️
if (totalIntake > TDEE)               → 'over_budget'   // 红色 ❌
```

### 4.3 目标模式计算

| 模式 | 目标缺口计算 |
|------|-------------|
| **目标模式** | 总减重 × 7700 ÷ 目标天数 |
| **高级模式** | 用户直接填写缺口值 |
| **维持模式** | 缺口 = 0 |
| **增肌模式** | 总增重 × 7700 ÷ 目标天数（盈余） |

### 4.4 安全校验

| 校验 | 规则 | 处理 |
|------|------|------|
| 预算下限 | 预算 < BMR × 0.8 | 警告"预算过低，建议降低缺口或增加运动" |
| 缺口上限 | |缺口| > 1000 | 警告"每日缺口超过 1000 千卡可能有健康风险" |

---

## 5. 估算引擎设计

### 5.1 规则引擎

```
输入文本
  → 拆分（逗号/顿号/"和"/"还"/"加"）
    → 每项匹配食物库（模糊匹配）
      → 应用标准份量
        → 标记置信度（全部 medium）
          → 返回结果
```

### 5.2 大模型模式

```
输入文本
  → 构造 Prompt（system + user）
    → fetch LLM API（超时 10s）
      → 成功 → 解析 JSON → 返回结果
      → 失败/超时 → 降级规则引擎
```

### 5.3 混合模式

```
输入文本
  → 规则引擎 → 结果 items
    → 匹配度高的 ✓
    → 匹配度低的（confidence=low 或 unknown）
      → LLM 兜底 → 替代低匹配项
        → 合并结果
```

---

## 6. 大模型 API 配置

### 6.1 支持的 API 格式

兼容 OpenAI Chat Completions API 格式：

```http
POST {apiEndpoint}
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "{modelName}",
  "messages": [...],
  "response_format": { "type": "json_object" }
}
```

### 6.2 配置项

| 字段 | 说明 | 示例 |
|------|------|------|
| apiEndpoint | API 请求地址 | https://api.deepseek.com/v1/chat/completions |
| apiKey | API 密钥 | sk-xxxxxxxx |
| modelName | 模型名称 | deepseek-chat |
| mode | 估算模式 | rule / llm / hybrid |

---

## 7. 组件设计

### 7.1 页面组件树

```
App.vue
├── Sidebar.vue (桌面端侧边栏)
│   └── TodaySummary.vue (今日概览)
│       ├── DeficitRing.vue (缺口环形图)
│       └── DeficitStatus.vue (状态标识)
├── MealRecord.vue (记录页)
│   ├── AIInput.vue (AI 输入区)
│   │   └── EstimateResultCard.vue (估算结果卡片)
│   ├── QuickRecord.vue (快捷记录)
│   ├── MealSection.vue (餐别分区)
│   │   └── MealItem.vue (食物条目)
│   └── DailySummary.vue (今日汇总)
├── FoodLibrary.vue (食物库页)
│   ├── FoodSearch.vue (搜索)
│   ├── FoodCategory.vue (分类浏览)
│   └── CustomFoodForm.vue (自定义食物)
├── StatsView.vue (统计页)
│   ├── TodayDistribution.vue (三餐分布饼图)
│   ├── WeeklyTrend.vue (七日趋势)
│   └── MonthCalendar.vue (月视图)
└── SettingsView.vue (设置页)
    ├── ProfileForm.vue (个人信息)
    ├── GoalSettings.vue (目标设置)
    ├── APIConfig.vue (大模型配置)
    └── WeightRecord.vue (体重记录)
```

---

## 8. 数据模型（简化版）

### 核心实体关系

```
UserSettings (1) ───→ 计算 → BMR / TDEE / DailyBudget
     │
     ├── WeightRecord (N) —— 体重历史
     │
FoodItem (N) ←─── MealRecord (N) —— 每日饮食记录
     │                    │
     │              （source: 'ai' | 'manual'）
内置库 + 自定义库
```

### 枚举汇总

| 枚举 | 值 |
|------|-----|
| FoodCategory | 主食、肉类、蔬菜、水果、饮品、零食、调味品、其他 |
| MealType | 早餐、午餐、晚餐、加餐 |
| ActivityLevel | 1(久坐) ~ 5(极高度) |
| DeficitStatus | in_deficit / near_limit / over_budget |
| GoalMode | target / advanced / maintain / bulk |
| EstimateMode | rule / llm / hybrid |
| Confidence | high / medium / low |
| RecordSource | ai / manual |

---

## 9. 非功能设计

| 维度 | 策略 |
|------|------|
| **性能** | 食物搜索 200ms 内（本地模糊过滤）；LocalStorage 读写 < 10ms |
| **离线** | 除 LLM API 调用外 100% 离线可用 |
| **安全** | API Key 存 LocalStorage，展示时遮盖；零后端 |
| **兼容** | Chrome/Edge/Safari 最新 2 版本；响应式桌面为主 |
| **存储压缩** | 使用 lz-string 压缩 LocalStorage 数据 |

---

## 10. 6 维设计审查

### ✅ 完整性
- PRD 覆盖完整 P0 功能：记录/食物库/统计/设置/AI 估算/API 配置
- 数据模型和业务规则完整

### ✅ 一致性
- BMR Mifflin-St Jeor / 活动系数 / TDEE / 预算 计算链路一致
- 缺口状态判定规则公式统一

### ✅ 可行性
- 纯前端 SPA，Vue 3 + Vite 技术成熟
- 规则引擎 AI 估算可纯前端实现
- 大模型 API 通过 fetch 直接调用（需 CORS 支持）

### ⚠️ 风险
| 风险 | 等级 | 应对 |
|------|------|------|
| LLM API CORS 限制 | 中 | 文档注明支持的 API 提供商 |
| 规则引擎准确率 | 中 | 混合模式 + 用户微调 |
| LocalStorage 5MB | 低 | 年数据 < 2MB |

### ✅ 可测试性
- 核心计算逻辑纯函数（BMR/TDEE/预算/缺口状态）
- AI 估算引擎可 mock 测试
- LocalStorage 可替换为内存存储

### ✅ 演进性
- 估算模式支持切换 + 扩展
- v1.0 → v1.1 → v1.2 渐进升级
- 自定义食物库渐进积累

---

## 11. 技术选型

| 项目 | 选择 | 理由 |
|------|------|------|
| 框架 | **Vue 3** + Composition API | 轻量，PRD 推荐 |
| 构建 | **Vite** | 极速 HMR |
| 样式 | **Tailwind CSS** | 原子化 CSS，快速原型 |
| 图表 | **Chart.js** | 轻量（饼图+折线图） |
| 存储 | **LocalStorage** + lz-string | 纯前端无需后端 |
| LLM | **fetch 直接调用** | 兼容 OpenAI API 格式 |
| 部署 | **GitHub Pages** | 免费静态托管 |

---

**维护**: 小龙虾
**版本**: v1.0