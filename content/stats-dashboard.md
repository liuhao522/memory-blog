---
name: stats-dashboard
description: 从零构建复杂数据大屏的完整复盘 — 跨库查询、ECharts 可视化、23 项 Bug 追踪、5 次架构迭代
metadata:
  node_type: memory
  type: project
  featured: true
  highlight: "5个Tab、12张数据表、9个关键设计决策、23项Bug追踪"
  tech:
    - Java Spring Boot
    - MyBatis-Plus
    - MySQL
    - Vue 3 + ECharts
    - FastJSON
  date: 2026-06-29
---

# 从零构建统计大屏：5 个 Tab、12 张表、23 项 Bug 的全链路复盘

> 独立负责 BladeX 平台数据可视化大屏的设计与开发。这不是一个简单的"接数据画图表"的任务——跨 4 个微服务的数据源、被同事代码覆盖的紧急修复、从 FastJSON 到 ECharts 的连环坑。这篇文章复盘我从 0 到 1 构建这套系统踩过的所有坑。

## 背景：为什么需要这个大屏？

BladeX 是一个智慧工牌平台，每天产生海量的录音和质检数据。管理层需要一个大屏来回答三个核心问题：

1. **服务效率**：多少员工在使用？产生多少录音？
2. **服务质量**：质检得分趋势如何？主要扣分在哪？
3. **人员效能**：谁做得好？谁需要改进？

这三个问题，最终变成了 5 个 Tab、12 张数据表、21 个 API。

## 架构设计：跨库查询的挑战

最大的挑战来自数据分布。录音数据在 `blade-device` 库，质检数据在 `blade-quality` 库，部门信息在 `blade-system` 库。常规做法是为每个数据源建微服务，但那样前端需要协调多个服务，性能差且耦合重。

我选择了一个"务实"的方案：

```
所有统计 API 放在 blade-record 模块
  → Mapper XML 跨库 JOIN blade-device / blade-quality / blade-system
  → 自建 VO 映射，不依赖其他模块的 Service
  → Controller 统一返回，前端只调一个服务
```

**Why blade-record?** 录音是数据的汇聚点——每条录音关联质检结果、部门、用户。以录音为轴心做聚合，SQL 写起来最自然。

## Tab1 服务效率：从覆盖率到趋势图

### 模型覆盖率环形图

第一个 Widget 看起来简单——一个环形图显示"有多少员工使用了 AI 模型"。但背后的 SQL 不容易：

- **分母**：`td_device_info` 中已绑定用户的工牌数（需要 JOIN `blade_user` 按部门过滤）
- **分子**：4 张表 UNION 去重——`td_voc_quality_result` / `td_voc_customer_analysis` / `td_voc_common_analysis` / `td_voc_common_industry`，取 `COUNT(DISTINCT device_no)`

每个 UNION 分支都要支持时间过滤和多部门 IN 查询。一开始我省略了某些分支的时间过滤，导致"本月覆盖率"算成了"历史覆盖率"。修复时发现 4 个分支都加了 `start_time >=/<=` 才算对。

### 多部门趋势折线图

这个功能花了我最多时间。需求是：按日/月/年查看各部门录音趋势变化曲线。

**核心问题**：SQL 返回的是扁平列表，但 ECharts 需要的是 pivot 后的矩阵（行=日期，列=部门）。而且当某个部门某天没有数据时，那条线会断掉，图表很难看。

**解决方案**——Java 层 pivot 聚合，8 步流程：

1. SQL 按 `dept_name + date_key` GROUP BY，返回扁平行
2. `generateFullXAxis()` 生成完整时间轴（无数据日期不跳过）
3. 构建 `Map<deptName, Map<dateKey, cnt>>` 二级映射
4. 按录音总量降序排列部门（大部门在上面）
5. 为每个部门构建 SeriesItem，缺失日期填 0
6. 计算"合并"线（所有部门 daily sum），插入第一系列（紫色虚线）
7. 组装 TrendVO 返回前端

这里踩过一个坑：**GROUP BY 只按 `dept_name` 不按 `dept_id`**。两个同名部门（不同父级）的数据被错误合并，趋势线异常飙升。加上 `c.dept_id` 解决。

## Tab2 服务质量：abilities JSON 解析的黑暗艺术

质检系统把每个维度的得分存在一个 JSON 字段 `abilities` 里。理论上用 MySQL 的 `JSON_EXTRACT` 能直接取，但实际存储格式复杂：

```json
// 开发者以为的格式：
{"服务礼仪": 90, "专业度": 85}

// 实际存储的格式：
{"items": [{"criterion": "购车需求挖掘评分标准", "score": 8}, ...]}
```

`JSON_EXTRACT` 对中文 key 的支持在旧版 MySQL 上不稳定，加上质检模型有多个版本、维度名称不完全一致。最终选择**在 Java 层做多策略关键词匹配**：

1. 先尝试直接 key-value 解析
2. 有 "items" 数组 → 遍历 criterion/text 做关键词匹配
3. 关键词标准化：去"能力""规范""遵守""性"后缀 → 取前 2 字符匹配

虽然这看起来很 hacky，但在生产环境中稳定运行。如果重来一次，我会推动后端同事把 JSON 结构标准化——这比写匹配逻辑更根本。

## Tab3 客户洞察：一个未完成的 Tab

Tab3 是个遗憾。前端代码写了 351 行，但全是 mock 数据——3 个假客户、8 个假标签。数据表 `td_voc_customer_analysis` 已经有 12 条真实数据，后端逻辑也设计好了（气泡矩阵、词云排名、360° 客户画像、触点时间线），但因为优先级被其他需求挤掉了。

**教训**：前端和后端应该在同一个迭代内同步推进，而不是前端先把 UI 画好等后端。mock 数据很容易让产品方以为"功能已经差不多了"。

不过我后来在 Tab3 中内嵌了一个**客户 360° 全景画像**功能——三表 JOIN + 意向/风险判定 + 关注商品聚合，接真实 API。算是部分弥补了这个遗憾。

## Tab4 人员效能：5 个 API 全部对接

Tab4 是最后一个完成的 Tab，但也是最完整的——5 个 API 全部对接，包括：

- **员工排名**：以 `td_device_info` 为基表 LEFT JOIN 质检结果，确保绑定工牌的用户全覆盖（即使无质检记录也显示"—"）
- **能力雷达**：个人 vs 团队双系列 ECharts 雷达图
- **成长曲线**：按周聚合的质检分趋势
- **情绪散点**：负面词频次 vs 质检分，定位"态度差但技术好"的异常员工
- **销冠案例**：从案例库中提取高分录音作为培训教材

### 排名基表修复

Tab4 差点毁在一次 Git 合并。同事推送了一个修改：排名 SQL 直接查 `td_voc_quality_result`。这会导致"没有质检记录的员工不显示在排名里"——排名榜变成了"有记录员工榜"。

我把 SQL 改回了以 `td_device_info` 为基表的 LEFT JOIN 方案，同时在所有时间字段上加了 `COALESCE(voc_record_start_time, end_time)`，防止 NULL 导致这些员工的数据断流。

## 修复时间线：23 项 Bug 的真实记录

这个项目让我学到的最重要一课：**复杂系统的 Bug 往往不是逻辑错误，而是边界条件遗漏**。

| 日期 | 关键修复 |
|------|---------|
| 6/24 | 初始实现：7 API 上线 |
| 6/25 | Period 重构 + 覆盖率 Widget + 趋势图 xAxis 补全 |
| 6/26 | 趋势图 8 项修复（SQL 上界、部门联动、竞态保护、跨年标签...） |
| 6/26 | Tab4 5 API 实现 + case status=1→2 修复 |
| 6/29 | **Git 回退修复**：恢复被同事覆盖的排名基表 + COALESCE 兜底 |
| 6/30 | ECharts 改造（3 图表）+ 真实音频播放器 + 客户 360° 画像 |

## 9 个关键设计决策

1. **代码放 blade-record 而非独立服务**——跨库 SQL 比微服务编排更可控
2. **质检去重**：`WHERE id IN (SELECT MAX(id) GROUP BY voc_record_id)`——避免同一录音多次质检拉偏均值
3. **abilities JSON 在 Java 层解析**——绕开 MySQL 中文 JSON key 兼容性问题
4. **branch→deptId 映射**：优先 region_code LIKE，降级 dept_name 模糊匹配
5. **排名基表用设备表 LEFT JOIN**——保证无质检记录员工也出现在排名中
6. **时间过滤双轨**：质检统计用 `end_time`（通话时间语义），录音趋势用 `start_time`
7. **Java 层 pivot + xAxis 补全**——保证图表无断线
8. **Nacos 多实例绕过**：vite 代理直连 localhost 绕过网关轮询
9. **竞态保护**：`watchEpoch` 计数器，每个 await 后校验

## 如果重来一次

1. **先定 JSON schema 再写代码**：abilities 字段的结构混乱是自找的
2. **前后端同一迭代交付**：Tab3 的 mock 拖延了问题暴露
3. **加集成测试**：23 项 Bug 中的 60% 可以通过 API 级别的集成测试捕获
4. **ProtoStuff → Jackson**：序列化兼容性问题趁早解决（[[redis-protoStuff-deserialize-fix]]）
