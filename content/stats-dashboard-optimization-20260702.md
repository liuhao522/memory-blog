---
name: stats-dashboard-optimization-20260702
description: 统计大屏多项体验优化 — 质检模型选择器、关注点/抗拒点图表重构、排名榜表格化、时间窗口调整
metadata:
  type: project
  tech:
    - Vue 3
    - ECharts
    - Spring Boot
    - MyBatis
    - MySQL
  date: 2026-07-02
---

# 统计大屏体验优化记录

## 1. 质检分数升级轨迹 · 优秀线标签

**问题**：成长曲线图中优秀线标签为"优秀线 80"，分数在后不够直观。

**改为**：`80分优秀线`，标签在虚线中段正上方居中（`position: 'middle', distance: 10`），不会被图表数据遮挡。

---

## 2. 质检模型选择器 · 最多6个 + 更多展开

**影响范围**：人员效能对比（Tab4）、服务质量分析（Tab2）

**规则**：
- ≤ 6 个模型：全部展示
- > 6 个模型：展示前 6 个 + **「更多…」**按钮，点击展开全部

**实现**：`showAllModels` ref + `displayedModels` computed（`slice(0, 6)`）。

---

## 3. 客户关注点 / 抗拒点图表重构

**旧方案**：xAxis = 时间周期，series = 动态 Top 6 点名 → 堆叠趋势图

**新方案**：xAxis = 数据库中真实点名按次数降序 **Top 10**，series = 1 条（跨周期求和）

**后端改动**：
- 删除硬编码的 5 个固定维度 + 关键词匹配表
- 改为直接按 `concern_points` / `resistance_points` 逗号拆分后的原始名称计数
- 跨时间窗口求和后降序取 Top 10
- 抗拒点保持同样的动态逻辑

**前端改动**：
- 单 series 多柱时每根柱子用不同颜色（`singleSeries` 检测，按 `dataIndex` 取色）
- 横坐标标签旋转 35° + `interval: 0` 强制全部显示 + 底部留白 60px
- 删除"提及次数"/"阻滞次数"图例

**数据流**：
```
DB concern_points → 逗号拆分 → 按原名计数 → 降序 Top 10 → xAxis
DB resistance_points → 逗号拆分 → 按原名计数 → 降序 Top 10 → xAxis
```

---

## 4. 人员效能对比 · 排名榜表格化

**旧方案**：卡片/列表双模式切换（`displayMode` toggle）

**新方案**：纯 HTML 表格，5 列（`#`、姓名、部门、质检均分、SOP率），表头 sticky 固定，行点击选中高亮。

去掉了卡片外层样式和切换按钮，代码更简洁。

---

## 5. 时间窗口统一调整

| 周期 | 旧窗口 | 新窗口 |
|------|--------|--------|
| 月 | 近 6 个月 | 近 3 个月 |
| 日 | 近 7 天 | 近 3 天 |
| 年 | 近 3 年 | 不变 |

修改位置：`StatsView.vue` 的 `filterStartTime` computed。

---

## 涉及文件

| 文件 | 改动 |
|------|------|
| `StatsPerformance.vue` | 排名榜卡片→表格、模型选择器、优秀线标签 |
| `StatsQuality.vue` | 模型选择器"更多"展开 |
| `StatsInsights.vue` | 图表渲染重构、横坐标修复、图例删除 |
| `StatsView.vue` | 时间窗口 6月→3月、7天→3天 |
| `QualityStatisticsServiceImpl.java` | 关注点/抗拒点动态 Top 10 聚合逻辑 |
