---
name: customer-profile-center-20260706
description: 客户画像中心从 aiai3 mock 迁移到 saber3 真实 API + 统计大屏数据全链路排查 + 数据库环境搭建
metadata:
  type: project
  tech:
    - Vue 3
    - Spring Boot
    - MyBatis
    - MySQL
    - ECharts
    - DBeaver
    - Playwright
  date: 2026-07-06
---

# 客户画像中心迁移 & 统计大屏数据链路排查

## 背景

统计大屏的客户洞察（Tab3）和销冠教材（Tab4）长期无数据，用户（统计局/890310）反馈"前瞻客商意向大图""TOP5好/坏客户""销冠教材"等功能全部空。今天做了一次全链路排查+修了一部分。

## 数据库全链路排查

用 MCP 直连远程 MySQL（39.130.140.19），逐表核查 890310 租户数据：

| 数据表 | 890310 (统计局) | 188252 (云南移动) | 
|--------|:---:|:---:|
| `td_device_voc_record_combine` | 175 ✅ | — |
| `td_voc_quality_result` | 175 ✅ | — |
| `td_voc_quality_detail` | 6395 ✅ | — |
| `td_voc_customer_analysis` | **0** ❌ | 14 |
| `td_voc_customer_analysis_detail` | **0** ❌ | 50 |
| `td_customer_info` | **0** ❌ | 6 |
| `td_case_detail` | 1 (status=1) ⚠️ | 5 (status=2) |

**结论**：Dify workflow 对 890310 的 175 条录音只执行了质检分析，没有执行客户分析节点。录音→质检链路完整，质检→客户分析链路完全断流。这解释了 Tab1/Tab2/Tab4 排名和扣分有数据，但 Tab3 和销冠教材全部为空的现象。

录音表还有一个致命问题：**175 条录音 `customer_id` 全为 NULL**，没有任何客户关联。即使补了客户分析数据，客户360画像也无法通过录音追溯到客户。

## 前端实测验证

用 Playwright 登录 15222222222（刘浩/统计局），逐一测试四个 Tab：

- **Tab1 服务效率** ✅ 覆盖率 100%，趋势图正常，累计客户数 0
- **Tab2 服务质量** ✅ 质检均分 84.1 分，扣分 -2576分/480次，但智能洞察报告全部"暂无数据"
- **Tab3 客户洞察** ❌ 全空 — 客户下拉空、产品比重空、标签词云空、关注点/抗拒点走势空
- **Tab4 人员效能** ⚠️ 排名 85.2/83.9 ✅ / 雷达 ✅ / 成长曲线 ✅ / 散点 ✅ / 销冠教材 **0例** ❌

代码层面也检查出几个问题：
- `StatsQuality.vue` 未声明 `deptIds` prop，父组件传递被丢弃
- `fetchTopCases({})` 传空参数，不随周期/部门变化刷新
- 销冠教材 SQL `WHERE cd.status = 2` 过滤掉了唯一的 status=1 案例
- `selectRadarDimensions` 缺租户隔离

但对 890310 当前数据量级（1 个部门/2 个员工/175 条录音）影响可忽略。

## DBeaver 数据库环境搭建

本地之前没有数据库图形化客户端，装了 DBeaver Community（免费开源）：

| 连接 | Host | Port | 库 | 用户 |
|------|------|:---:|------|------|
| 远程（统计局数据） | 39.130.140.19 | 3306 | voice_quality_dev | root |
| 本地 | localhost | 3306 | order_system | root |

> IDEA Community 版没有内置 Database 工具，DBeaver 作为替代方案日常查表足够了。

## 客户画像中心：aiai3 → saber3 迁移

### 做了什么

aiai3 的 `CustomerView.vue`（463行，纯 mock 10条假数据）迁移到 saber3 `CustomerProfileCenter.vue`，对接真实后端 API。

**Mock 字段 → 真实数据映射**：

| Mock 字段 | 真实数据源 | API |
|------|------|------|
| `name/phone` | `td_customer_info` | 现成 |
| `tags/focusProducts` | `td_voc_customer_analysis` | 现成 `customer-profile` |
| `focusPoints/resistancePoints` | `concern_points/resistance_points` | 现成 |
| `intentLevel` | SQL CASE WHEN 关键词匹配 | **新增** |
| `riskLevel` | `need_follow_up` = '是' | **新增** |
| `timeline` | 录音+质检 JOIN | 现成 |
| `budget` | **无真实数据源** | 已删除 |

### 新增后端 API

`GET /qualityStatistics/customer-page` — 客户分页列表（含 AI 摘要）

**改动文件**：
- `CustomerRankVO.java` — 新增 tags/focusProducts/focusPoints/resistancePoints/latestRecordId/latestRecordTime
- `QualityStatisticsMapper.xml` — 新增 selectCustomerPage + selectCustomerPageCount
- `QualityStatisticsController.java` — 新增 /customer-page 端点

**核心 SQL**：每个客户取最新一条录音，JOIN `td_voc_customer_analysis` + `td_voc_quality_result`，意向/风险等级在 SQL 中用 CASE WHEN 直接计算，不在 Java 层二次处理。

### 前端组件

- 双视图：列表（搜索+意图/风险筛选+分页）+ 详情（360° 画像+AI 分析+Timeline）
- 删除所有 budget 展示
- 路由：`/customer-profile/index`

## 黄金行情

今天 AU0 从 ¥918 尾盘砸到 ¥906.3，收 ¥907.82。MA5/MA10 金叉还在但重新跌破 MA20（¥909.6）。59g 持仓均价 ¥900.10，整体仍浮盈 ¥455。策略不变：反弹到 ¥912-914 平推 ¥912 包袱，¥894 压舱石不动等 7/9 CPI。

