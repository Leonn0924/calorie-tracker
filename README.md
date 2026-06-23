# 热量缺口管理工具 (Calorie Tracker)

> 个人单机版 Web 热量管理工具，帮助用户通过科学计算和智能记录来制造热量缺口，实现健康减脂目标。

## 🚀 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **样式**: Tailwind CSS
- **图表**: Chart.js + vue-chartjs
- **存储**: LocalStorage + lz-string (压缩)
- **日期**: date-fns
- **部署**: GitHub Pages (纯静态)

## 📦 项目结构

```
src/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── TodaySummary.vue
│   │   └── TabButton.vue
│   ├── views/               # 页面视图
│   │   ├── RecordView.vue
│   │   ├── FoodLibraryView.vue
│   │   ├── StatsView.vue
│   │   └── SettingsView.vue
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # LocalStorage 封装
│   │   ├── calculator.ts    # BMR/TDEE 计算
│   │   └── date.ts          # 日期处理
│   ├── composables/         # Vue 组合式函数
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── openspec/                # OpenSpec 规格文档
│   └── changes/calorie-tracker/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       ├── specs/spec.md
│       ├── prototype/
│       └── review/approval.md
└── PRD-热量记录工具.md
```

## 🔧 开发

```bash
# 安装依赖
cd src
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📋 核心功能

### Phase 1: 项目初始化 ✅
- [x] Vite + Vue 3 + TypeScript 项目搭建
- [x] Tailwind CSS 配置（自定义 health-* 色系）
- [x] TypeScript 类型定义（所有枚举和接口）
- [x] LocalStorage 工具封装（lz-string 压缩）
- [x] 日期工具封装（date-fns）
- [x] 基础布局框架（侧边栏 + Tab 切换）

### Phase 2: 核心计算引擎 ✅
- [x] BMR 计算（Mifflin-St Jeor 公式）
- [x] TDEE / 每日预算 / 缺口状态计算
- [x] 目标模式自动计算
- [x] 安全校验
- [x] 净缺口计算（含运动消耗）
- [x] 25 个单元测试全部通过
- [x] useSettings composable
- [x] useDailyStats composable

### Phase 3: AI 估算引擎 ✅
- [x] 规则引擎（关键词拆分 + 标准份量表）
- [x] 食物库匹配（28 种常见食物，支持别名搜索）
- [x] 大模型客户端（OpenAI 兼容 API）
- [x] 混合模式（规则优先，LLM 兜底）
- [x] Prompt 模板 + JSON 解析
- [x] AI 估算结果卡片组件
- [x] useAIEstimation composable
- [x] 17 个单元测试全部通过

### Phase 4: 饮食记录 ✅
- [x] AI 智能描述输入组件（AIInput.vue）
- [x] 快捷记录组件（QuickRecord.vue）
- [x] 三餐分区展示组件（MealSections.vue）
- [x] 今日缺口概览组件（TodaySummary.vue）
- [x] 编辑/删除功能
- [x] 热量颜色标识（绿/黄/红）
- [x] RecordView 整合所有组件

### Phase 5: 食物库 ✅
- [x] 内置食物库数据（28 种常见食物，含详细营养信息）
- [x] 食物库页面（FoodLibraryView.vue）
- [x] 搜索功能（支持名称和别名搜索）
- [x] 分类浏览和筛选
- [x] 食物详情弹窗
- [x] 自定义食物新增表单
- [x] 自定义食物删除功能
- [x] useFoodLibrary composable

### Phase 6: 运动消耗 ✅
- [x] 预设运动数据（16 种常见运动，含 MET 值）
- [x] 运动快捷记录 UI（按钮网格）
- [x] 运动时长输入 + 消耗计算（MET × 体重 × 时间）
- [x] 自定义运动表单
- [x] 运动日志列表 + 删除
- [x] 运动记录存储（LocalStorage）
- [x] ExercisePanel 组件
- [x] useExercise composable

### Phase 7: 统计页面 ✅
- [x] 今日缺口展示卡片
- [x] 三餐热量分布饼图（SVG 实现）
- [x] 七日缺口趋势柱状图
- [x] 达成率统计（环形进度图）
- [x] 周统计汇总（平均摄入/消耗/缺口）
- [x] useStats composable
- [x] 5 个统计组件

### Phase 8: 设置页面 ✅
- [x] 个人信息表单（性别/年龄/身高/体重/活动水平）
- [x] BMR/TDEE/预算实时计算展示
- [x] 目标设置（4 种模式：目标/高级/维持/增肌）
- [x] 估算模式切换（规则/大模型/混合）
- [x] 大模型 API 配置（端点/Key/模型/超时/token）
- [x] API 连接测试功能
- [x] 体重记录（添加/删除/历史列表）
- [x] 体重变化统计（绝对值/百分比）
- [x] useWeight composable
- [x] 5 个设置组件

### Phase 9: 集成与测试 ✅
- [x] 端到端流程测试（设置→记录→运动→统计→修改）
- [x] 边界情况测试（空数据/异常输入/API 失败）
- [x] 响应式适配（移动端 TabBar）
- [x] 部署配置（GitHub Pages）
- [x] 单元测试（56 个测试用例，100% 通过）
- [x] 测试报告生成

## 📊 核心算法

### BMR 计算（Mifflin-St Jeor 公式）
```
男性：BMR = 10 × 体重(kg) + 6.25 × 身高(cm) − 5 × 年龄 + 5
女性：BMR = 10 × 体重(kg) + 6.25 × 身高(cm) − 5 × 年龄 − 161
```

### TDEE 计算
```
TDEE = BMR × 活动系数
活动系数：1.2(久坐) / 1.375(轻度) / 1.55(中度) / 1.725(高度) / 1.9(极高度)
```

### 净缺口计算
```
净缺口 = 饮食预算 + 运动消耗 - 已摄入
饮食预算 = TDEE - 目标缺口
```

## 🎨 设计规范

### 颜色系统
- 主色: `#10B981` (翠绿)
- 警告: `#F59E0B` (琥珀)
- 危险: `#EF4444` (红色)
- 信息: `#0891B2` (青色)
- 运动: `#3B82F6` (蓝色)
- 体重: `#8B5CF6` (紫色)

### 缺口状态颜色
- 🟢 在缺口内: `已摄入 ≤ 预算`
- 🟡 接近上限: `预算 < 已摄入 ≤ TDEE`
- 🔴 已超支: `已摄入 > TDEE`

## 📝 文档

- [PRD](./PRD-热量记录工具.md) - 产品需求文档
- [设计文档](./openspec/changes/calorie-tracker/design.md) - 业务设计
- [规格文档](./openspec/changes/calorie-tracker/specs/spec.md) - OpenSpec 规格
- [任务拆解](./openspec/changes/calorie-tracker/tasks.md) - 开发任务
- [交互原型](./openspec/changes/calorie-tracker/prototype/index.html) - HTML 原型
- [审批文档](./openspec/changes/calorie-tracker/review/approval.md) - 研发审批

## 📄 许可证

MIT License

---

**维护**: 小龙虾  
**版本**: v1.0 MVP  
**最后更新**: 2026-06-23