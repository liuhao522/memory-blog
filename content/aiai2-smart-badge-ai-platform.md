---
name: aiai2-smart-badge-ai-platform
description: 凡见智慧AI工牌系统 — 基于 Google AI Studio 的纯前端原型，融合硬件拾音+AI转写+智能质检+客户洞察
metadata:
  type: project
  tech:
    - Vue 3.5
    - Vite 6
    - Element Plus 2.14
    - Tailwind CSS 4
    - ECharts 6
    - Lucide Vue Next
    - Motion (动画库)
    - Google Gemini AI (@google/genai 2.4)
    - Express 4 (服务端)
  date: 2026-06-18
  originSessionId: current
---

# 凡见智慧 AI 工牌综合管理平台 (aiai2)

**路径**: `D:\voice\aiai2`
**类型**: Google AI Studio 应用 — 纯前端原型/Demo
**状态**: Mock 数据驱动，未连接真实后端

## 核心定位

与 BladeX/Saber3（后端+低代码，真实生产系统）不同，aiai2 是一个**现代化纯前端原型**，用于快速验证和展示 AI 工牌产品的交互体验。使用 Google Gemini AI 作为 LLM 后端，通过 API Key 调用。

## 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 框架 | Vue 3.5 (Composition API) | `<script setup lang="js">` |
| 构建 | Vite 6 | 端口 3000 |
| UI | Element Plus 2.14 + Tailwind CSS 4 | 混合使用 |
| 图表 | ECharts 6 | 统计分析大盘用 |
| 图标 | Lucide Vue Next | 全项目统一图标库 |
| 动画 | Motion | framer-motion 的 Vue 版 |
| AI | @google/genai 2.4 | Gemini API 调用 |
| 服务 | Express 4 | 后端 API (如果有) |

## 7 大功能模块

### 1. 工作台主页 (DashboardView)
- 三种角色视图切换: 集团高管 / 分支经理 / 一线员工
- 高管: 4 KPI 卡片 + 待办中心 + 分支机构排名 + 系统公告
- 区经: 分支级 KPI + 员工效能排名表 + 待处理事务
- 员工: 个人指标 + 最近录音列表 + 标杆学习角
- 通知详情弹窗 (Markdown 渲染)

### 2. 统计分析大盘 (StatsView + 4 子组件)
- 三级漏斗筛选: 时间周期 + 组织结构树 + 员工多选搜索
- 4 个分析维度 Tab:
  - **服务效率分析** (StatsEfficiency) — 日/月/年覆盖趋势
  - **服务质量分析** (StatsQuality) — 扣分雷达图/维度排名
  - **客户洞察分析** (StatsInsights) — 流失矩阵 2D
  - **人员效能对比** (StatsPerformance) — 销冠教材提取
- 高管经营大屏模式 (StatsScreen)
- Excel 导出模拟动画
- 录音下钻播放舱 (声学调音台)

### 3. 对话录音调听 (FileView)
- 左栏: 录音列表筛选 (行业/分数范围/搜索)
- 中栏: 音频播放器 (波形可视化 + 时间线 + 扣分标记点跳转)
- 对话转写气球 (员工蓝/客户绿，播放同步高亮)
- 右栏: AI 分析侧边栏 4 Tab
  - AI质检得分 (评分圆环 + 扣分规则触发列表)
  - 客户画像 (关注点/抗拒点标签)
  - 声纹比对 (说话人匹配度)
  - 对话摘要 (结构化总结)
- 支持重新转写/重新质检/声纹配准

### 4. 智能质检模型 (ModelView)
- 左栏: 质量模型模板列表 (启用状态/行业类别)
- 右栏: 规则维度和扣分标准配置器
  - 维度权重滑块
  - 拦截指标细则列表
- LLM Prompt 模板预览

### 5. 工牌设备管理 (DeviceView)
- 左栏: 设备列表 (在线状态/电量/告警)
- 右栏:
  - SVG 模拟 GPS 轨迹地图
  - 参数下发面板 (心跳间隔/GPS上报间隔)
  - 心跳日志流终端

### 6. 客户画像中心 (CustomerView)
- 左栏: 客户名册 (意向/流失等级)
- 右栏:
  - 360度客户全量画像
  - 关注点/抗拒点标签
  - 预算意向额度
  - 面谈沟通时序里程碑 (Timeline)

### 7. 优秀案例培训 (CasesView)
- 标杆案例卡片列表
- 播放次数/质检分/标签
- 调听标杆录音

## Mock 数据 (mockData.js)

3 条模拟录音记录:
- 张建国 (汽车销售, 83分/良, 有扣分项)
- 王晓燕 (金融保险, 95分/优, 零扣分)
- 陈伟东 (家装设计, 54分/不及格, 严重违规)

4 台模拟设备:
- ZHGP-0012/0024/0015/0089 (不同类型/在线状态/告警)

3 套质检模型:
- 豪华车交付 (服务态度+专业度+禁止违规, 3 维度)
- 理财年金险 (风险告知+合规销售, 2 维度)
- 全屋定制 (服务基本礼仪, 1 维度)

3 个客户档案:
- 李静如 (高意向/中风险)
- 赵国强 (高意向/低风险)
- 孙梅芳 (流失风险/高风险)

2 个标杆案例 + 2 条系统公告

## 与 BladeX/Saber3 工牌系统的关系

| 维度 | aiai2 | BladeX/Saber3 |
|------|-------|---------------|
| 类型 | 原型/Demo | 生产系统 |
| 架构 | 纯前端 + Mock | Spring Boot + Vue + MyBatis-Plus |
| 部署 | Google AI Studio | 私有化服务器 |
| 数据 | 静态假数据 | 真实数据库 (MySQL + Redis) |
| AI | Google Gemini | 自建/第三方 |
| 设备通信 | 模拟 | MQTT 真实连接 |
| 多租户 | 无 | full SaaS (tenant_id) |
| 打卡功能 | 无 | 完整实现 (v3) |

aiai2 是 BladeX/Saber3 工牌系统的**产品原型/概念验证版本**，用于快速展示 AI 工牌的产品理念和交互设计。

## 统计大屏已迁移至 Saber3

**日期**: 2026-06-23
**操作**: 将 aiai2 统计大屏（StatsView + 5 个子组件 + mockData）原样复制到 saber3

### 复制的文件

```
D:\voice\aiai2\                          →  D:\voice\saber3\src\views\desk\
  src/components/StatsView.vue               StatsView.vue
  src/mockData.js                            mockData.js
  src/components/stats/StatsEfficiency.vue   stats/StatsEfficiency.vue
  src/components/stats/StatsQuality.vue      stats/StatsQuality.vue
  src/components/stats/StatsInsights.vue     stats/StatsInsights.vue
  src/components/stats/StatsPerformance.vue  stats/StatsPerformance.vue
  src/components/stats/StatsScreen.vue       stats/StatsScreen.vue
```

### CSS 适配

aiai2 使用完整 Tailwind CSS JIT 引擎，saber3 只有 `tailwind-compat.css`（有限子集，697行）。
统计大屏组件使用了 560+ 个 Tailwind 类名，大量在 saber3 中缺失。

**解决**: 在 `tailwind-compat.css` 末尾**追加**了 ~720 行 CSS（697→1420行），**未修改任何原有内容**。
覆盖的缺失类别：Grid布局、宽高、间距、深色主题色、透明度变体、响应式断点、按钮重置、动画等。

**访问方式**: 后端菜单管理中添加路径为 `/desk/StatsView` 的菜单项，利用 saber3 的 avue-router 动态路由自动匹配。

### 关键依赖（均已存在于 saber3）

| 依赖 | saber3 中状态 |
|------|-------------|
| echarts ^6.0.0 | ✅ 已安装 |
| lucide-vue-next ^1.0.0 | ✅ 已安装 |
| vue ^3.5 | ✅ 运行中 |

### 注意事项

- 统计大屏目前使用 **Mock 数据**（mockData.js），未对接 saber3 后端 API
- saber3 原有的独立统计页面（record/quality/device/model/customerAnalysis）**不受影响**，仍然可用
- tailwind-compat.css 的追加内容全部在文件末尾，原有样式不变

## 启动方式

```bash
cd D:\voice\aiai2
npm install
# 配置 .env.local 中的 GEMINI_API_KEY
npm run dev     # 启动在 http://localhost:3000
npm run build   # 构建生产版本
```

## 关联记忆

- [[bladex-backend-overview]] — 生产环境后端 (Spring Boot, BladeX)
- [[saber3-frontend-overview]] — 生产环境前端 (Vue 3, Saber3)
- [[smart-badge-platform-user-manual]] — 智慧工牌平台全貌
- [[checkin-feature-v3-complete]] — 打卡功能 v3 (仅 BladeX/Saber3 有)
