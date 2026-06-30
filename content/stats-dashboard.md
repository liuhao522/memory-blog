---
name: stats-dashboard
description: 统计大屏完整知识图谱 — 5 Tab架构、全部API、数据表、修复历史、已知问题
metadata: 
  node_type: memory
  type: project
  tech: 
    - Java Spring Boot
    - MyBatis-Plus
    - MySQL
    - Vue 3 + ECharts
    - FastJSON
  date: 2026-06-29
  modules: 
    - saber3 (前端 28文件)
    - blade-record (后端Controller/Service/Mapper/VO)
    - blade-device (数据源: td_device_voc_record_combine 等)
    - blade-quality (数据源: td_voc_quality_result 等)
  originSessionId: 9f146a9e-ef34-40ba-b7de-dedc6a30735c
---

# 统计大屏知识图谱

## 架构总览

```
saber3/src/views/desk/
├── StatsView.vue                      ← 父容器: period/deptId/userIds 参数管理
├── stats/
│   ├── StatsEfficiency.vue            ← Tab1 ✅ 部分对接 (3 Widget, 2/3 完成)
│   ├── StatsQuality.vue               ← Tab2 ✅ 部分对接 (4 Widget, 2/4 完成)
│   ├── StatsInsights.vue              ← Tab3 ❌ 全 mock
│   ├── StatsPerformance.vue           ← Tab4 ✅ 5 API 全部对接
│   ├── StatsScreen.vue                ← 大屏 ❌ 全 mock
│   ├── StatsDeductionDistribution.vue ← 扣分分布饼图 (ECharts版)
│   ├── StatsIntelligenceReport.vue    ← TOP10关注+好/坏客户
│   └── StatsRankingList.vue           ← 门店质检排名
├── components/ (11 共享组件)
├── mockData.js
├── record.vue / device.vue / quality.vue / model.vue / customerAnalysis.vue
├── notice.vue / notice-composition.vue
│
saber3/src/api/desk/statistics.js      ← 21 个 API 函数
│
▼ HTTP (vite 代理: /api/blade-record/* → localhost:8204 绕过 Nacos)
│
blade-service/blade-record/src/main/java/org/springblade/record/
├── controller/
│   ├── StatsDashboardController.java      ← 旧: 7 GET 端点 @ /stats/dashboard
│   ├── VocRecordStatisticsController.java ← 录音趋势+摘要
│   ├── QualityStatisticsController.java   ← 质检统计 (含 Tab4 全部 5 API)
│   ├── ModelCoverageController.java       ← 模型覆盖率
│   └── PersonalStatisticsController.java  ← 个人统计
├── service/
│   ├── IStatsDashboardService / impl/
│   ├── IVocRecordStatisticsService / impl/
│   ├── IQualityStatisticsService / impl/
│   ├── IModelCoverageService / impl/
│   └── IPersonalStatisticsService / impl/
├── mapper/
│   ├── StatsDashboardMapper.java/.xml
│   ├── VocRecordStatisticsMapper.java/.xml
│   ├── QualityStatisticsMapper.java/.xml
│   └── ModelCoverageMapper.java/.xml
└── pojo/vo/
    ├── EfficiencyCoverageVO / EfficiencyTrendVO / TrendSeriesVO / EfficiencyRecordVO
    ├── QualityTrendVO / QualityRadarVO / RadarDimensionVO / QualityViolationPieVO / QualityViolationItemVO
    ├── TrendVO (内部类 SeriesItem)
    ├── ModelCoverageVO
    ├── StaffRankingVO / EmployeeRadarVO / GrowthCurveVO / EmotionScatterVO / TopCaseVO
    └── VocRecordStatisticsVO / QualityStatisticsDTO / VocRecordStatisticsDTO
```

**命名体系变更**: 早期 `StatsDashboard*` 命名已重构为 `VocRecordStatistics*` + `QualityStatistics*` 体系。

| 旧名 | 新名 |
|------|------|
| `StatsDashboardController` | `VocRecordStatisticsController` + `QualityStatisticsController` |
| `EfficiencyTrendVO` + `TrendSeriesVO` | `TrendVO` (含内部类 `SeriesItem`) |
| `GET /stats/dashboard/efficiency/trend` | `GET /blade-record/vocRecordStatistics/trend` |
| `getEfficiencyTrend` | `getRecordTrend` |

---

## 对接状态矩阵

| Tab | 前端组件 | Widget数 | 已对接 | Mock | API数 |
|-----|---------|:---:|:---:|:---:|:---:|
| Tab1 服务效率 | StatsEfficiency.vue | 3 | 2 (覆盖率+趋势) | 1 (明细表) | 3 |
| Tab2 服务质量 | StatsQuality.vue | 4 | 2 (趋势+雷达) | 2 (排名+扣分) | 4 |
| Tab3 客户洞察 | StatsInsights.vue | 4 | 0 | 4 | 0 |
| Tab4 人员效能 | StatsPerformance.vue | 5 | 5 | 0 | 5 |
| 大屏模式 | StatsScreen.vue | 3 | 0 | 3 | 0 |

---

## Tab1 服务效率 (StatsEfficiency)

### Widget 1: 服务员工参与覆盖率 (模型覆盖率环形图)

**前端**: `#eff-coverage-card` — el-select-v2 模型下拉框 + ECharts 环形进度图

**API**: `GET /blade-record/modelCoverage/coverage?modelId=&startTime=&endTime=&deptIds=`

**后端文件** (6个):
- `ModelCoverageVO.java` — `{assignedCount, usedModelCount, coverageRate}`
- `ModelCoverageMapper.java/.xml` — selectAssignedCount + selectUsedModelCount
- `ModelCoverageController.java` / `IModelCoverageService.java` / `ModelCoverageServiceImpl.java`

**计算逻辑**:
- 分母 = `td_device_info` 中 `user_id IS NOT NULL AND is_deleted=0` 的已分配工牌数 (INNER JOIN `blade_user` 按部门过滤)
- 分子 = 4表UNION去重: `td_voc_quality_result` / `td_voc_customer_analysis` / `td_voc_common_analysis` / `td_voc_common_industry`，按 `device_no` COUNT DISTINCT
- 4个UNION分支全部支持 `c.start_time >=/<=` 时间过滤 + `deptIds` IN 过滤
- coverageRate = BigDecimal 计算，保留1位小数
- 按 period 计算时间窗口: day=当天00:00~now, month=本月1日~now, year=今年1/1~now

### Widget 2: 总录音量与多大区波动曲线 (趋势折线图)

**前端**: `#eff-trend-card` — 按日/按月/按年切换 + ECharts 多系列折线图 + 摘要卡片

**API**: 
- `GET /blade-record/vocRecordStatistics/trend?startTime=&endTime=&period=day&deptId=` → TrendVO
- `GET /blade-record/vocRecordStatistics/summary?period=` → 摘要 (customerCount, transcribedCount, 环比增长率)

**后端文件** (6个修改):
- `TrendVO.java` — `{xAxis:List<String>, series:List<SeriesItem{name, data}>}`
- `VocRecordStatisticsMapper.java/.xml` — selectTrend + selectStatistics
- `VocRecordStatisticsServiceImpl.java` — trend() pivot 聚合逻辑
- `VocRecordStatisticsController.java` — GET /trend, GET /summary

**SQL** (selectTrend):
```sql
SELECT
  DATE_FORMAT(c.start_time, <format>) AS date_key,  -- %m-%d / %m月 / %Y年
  COALESCE(d.dept_name, '未分配') AS dept_name,
  COUNT(*) AS cnt
FROM td_device_voc_record_combine c
LEFT JOIN blade_dept d ON d.id = c.dept_id AND d.is_deleted = 0
WHERE 1=1
  AND c.url IS NOT NULL
  [AND c.tenant_id = #{tenantId}]  -- 平台管理员(000000)跳过
  AND c.start_time >= #{startTime}
  AND c.start_time <= #{endTime}   -- ⚠️ 修复后: 用 start_time 而非 end_time
  [AND c.dept_id IN <foreach deptIdList>]
GROUP BY date_key, c.dept_id, d.dept_name   -- ⚠️ 修复后: 加 dept_id 防同名合并
ORDER BY date_key, cnt DESC
```

**Java Pivot 8步流程**:
1. 确定 dateFormat + 按年自动扩展到近3年
2. Mapper 返回 `List<Map>` 扁平行
3. `generateFullXAxis(startTime, endTime, period)` 生成完整时间轴 (无数据日期补全)
4. 构建 `Map<deptName, Map<dateKey, cnt>>`
5. 按录音总量降序排列部门
6. 为每个部门构建 SeriesItem (缺失日期填0)
7. 计算"合并"线 (所有部门 daily sum)，插入 series[0]
8. 组装 TrendVO

**generateFullXAxis**: day=逐日 "MM-dd", month=逐月 "MM月", year=逐年 "yyyy年"，跨年模式下SQL输出 `DATE_FORMAT('%Y-%m')` (防"12月→01月"歧义)。

**摘要卡片**: 累计服务客户总数 (customerCount) + 录音转写产出总量 (transcribedCount = COUNT(url))，各带环比增长率 (自然周期: 今天vs昨天/本月vs上月/今年vs去年)。

**前端渲染**: 合并线=紫色虚线(#6366f1, width:3, lineDash:[5,5])，部门线=8色调色板轮转实线(width:2)。

### Widget 3: 录音明细表

**当前状态**: ⚠️ 硬编码 `rawServiceRecords` (7条假数据)，未对接后端分页API

**API**: `GET /stats/dashboard/efficiency/records?timeRange=&branch=&searchEmployee=&current=&size=`
- 从 `td_device_voc_record_combine` LEFT JOIN `td_voc_quality_result` (去重取最新) + `blade_dept` + `td_customer_info`
- CASE status: url IS NULL→异常极短, score IS NULL→待质检, score>=80→正常, score>=60→注意, else→违规
- 支持 searchEmployee 多选 (逗号拆分 → IN 查询)

---

## Tab2 服务质量 (StatsQuality)

### Widget 1: 质检得分趋势

**API**: `GET /blade-record/qualityStatistics/trend?period=&startTime=&endTime=&deptIds=`

**后端文件**:
- `QualityTrendVO.java` — `{xAxis, series:[{name, data:Double[]}]}`
- `QualityStatisticsMapper.xml` — selectScoreTrend
- `QualityStatisticsController.java` — GET /qualityStatistics/trend

**SQL关键点**:
- 用 `COALESCE(voc_record_start_time, end_time)` 兜底 (部分记录 voc_record_start_time 为 NULL)
- 子查询去重: `WHERE q.id IN (SELECT MAX(id) GROUP BY voc_record_id)` (避免同一录音多次质检拉偏均值)
- 支持 deptIds 多部门 IN 过滤
- 部门多选: el-select-v2 multiple, join(',') 传给 deptIds

### Widget 2: 五维雷达图

**API**: `GET /stats/dashboard/quality/radar?timeRange=&branch=`

**双查询**:
1. `selectRadarDimensions` → 取最常用模型的维度定义 (5维: 服务礼仪/专业度/SOP规范/红线遵守/逻辑连贯)
2. `selectAbilitiesRaw` → 取所有 abilities JSON 原始字符串

**abilities JSON 格式与实际解析**:
```json
// 实际存储格式 (数组):
{"items": [{"content":"...", "criterion":"购车需求挖掘评分标准", "score":8}, ...]}

// 旧代码假设的格式 (键值对) — 不匹配:
{"服务礼仪": 90, "专业度": 85}
```

**修复后的解析逻辑** (`findAbilityValueByName` + `matchesKeyword`):
1. 先尝试直接 key-value 格式解析
2. 如果 JSON 有 "items" 数组，遍历 items[]，将 item.criterion/text 与维度名做关键词匹配
3. 关键词匹配: 去"能力""规范""遵守""性"后缀 → 拆2字短词 → 包含匹配
4. 按维度累加 / count = 均分，cap 在 100

**已知问题**: 匹配规则较粗 (前2字符匹配) 可能误匹配，需持续关注。

### Widget 3: 扣分类型饼图

**API**: `GET /stats/dashboard/quality/violation-pie?timeRange=&branch=`
- SQL: `SELECT dim_name, COUNT(*) AS count, SUM(score) AS totalDeduction FROM td_voc_quality_detail d JOIN td_voc_quality_result q GROUP BY dim_name ORDER BY totalDeduction DESC`
- VO: `QualityViolationPieVO { dimension, count, totalDeduction }`
- 颜色由前端分配

### Widget 4: 违规明细列表

**API**: `GET /stats/dashboard/quality/violation-list?timeRange=&branch=`
- SQL: `SELECT d.id, d.dim_name, d.reason, d.score, d.origin, q.voc_record_id FROM td_voc_quality_detail d JOIN td_voc_quality_result q ORDER BY d.score DESC`
- 已知差距: 无录音中违规时间位置字段 (如 "01:15")，数据库无此字段

---

## Tab3 客户洞察 (StatsInsights) — 未实现

**前端**: StatsInsights.vue (351行) — 全部硬编码 mock 数据 (3个假客户, 8个假标签)

**数据表已就绪**: `td_voc_customer_analysis` (12条) + `td_voc_customer_analysis_detail` (50条) + `td_customer_info`

**待实现4个Widget**:
1. 气泡矩阵 — `intentional_analysis` 文本做意向强度分析 + `need_follow_up` → 流失风险
2. 词云/排名 — `GROUP BY tag_name` 从 `td_voc_customer_analysis_detail` 统计频次
3. 360°客户档案 — 三表 JOIN: `td_customer_info` + `td_voc_customer_analysis` + `td_device_voc_record_combine`
4. 触点时间线 — 按 `customer_id + voc_record_start_time` 排序展示沟通摘要

**已知问题**: StatsView 传给 StatsInsights 的 props 不匹配 (传 `selectedDeptId/selectedUserIds`，组件内用 `timeRange/selectedBranch/searchEmployee`)

---

## Tab4 人员效能 (StatsPerformance) — 全部对接 ✅

### 文件清单 (10个后端 + 2个前端)

**后端** (blade-record):
- `QualityStatisticsController.java` — 5 个 GET 端点
- `IQualityStatisticsService.java` / `QualityStatisticsServiceImpl.java`
- `QualityStatisticsMapper.java` / `QualityStatisticsMapper.xml`
- VO: `StaffRankingVO` / `EmployeeRadarVO` / `GrowthCurveVO` / `EmotionScatterVO` / `TopCaseVO`

**前端**:
- `StatsPerformance.vue` (485行)
- `statistics.js` (API 函数: getStaffRanking, getTeamAbilities, getGrowthCurve, getEmotionScatter, getTopCases)

### API 1: 员工质检排名 `GET /qualityStatistics/staff-ranking`

**SQL** (selectStaffRanking — 2026-06-29 最终版):
```sql
-- 基表: td_device_info (工牌绑定用户全覆盖)
SELECT DISTINCT u.user_id, u.username, u.dept_id, u.tenant_id
FROM td_device_info u WHERE u.user_id IS NOT NULL AND u.is_deleted = 0

-- LEFT JOIN 质检子查询 (去重取最新)
LEFT JOIN (
  SELECT r.user_id, r.score, ...
  FROM td_voc_quality_result r
  WHERE r.id IN (SELECT MAX(r2.id) FROM td_voc_quality_result r2
                 WHERE r2.tenant_id = #{tenantId}
                   AND COALESCE(r2.start_time, r2.end_time) BETWEEN #{startTime} AND #{endTime}
                   [AND r2.model_id = #{modelId}]
                 GROUP BY r2.voc_record_id)
) q ON q.user_id = u.user_id

GROUP BY u.user_id, u.username, u.dept_name
ORDER BY avgScore DESC NULLS LAST
```

**VO**: `StaffRankingVO { userId, username, deptName, avgScore, totalCount, sopRate }`
- avgScore = NULL 时前端显示 "—" (无质检记录)
- sopRate 当前返回 null (占位)，前端显示 "—"

### API 2: 员工能力雷达 (ECharts 双系列)

**废弃**: `GET /employee-radar` (旧5维SVG方案)

**新方案**: `GET /qualityStatistics/team-abilities` × 2
1. `getTeamAbilities({ userIDs: String(userId), modelId, startTime, endTime })` → personal items
2. `getTeamAbilities({ modelId, startTime, endTime })` → team items + recordCount

**前端**: 合并两个指标集合 → radarIndicators (去重 criterion) → ECharts radar 双系列
- 个人线: indigo #6366f1, 实线, 填充20%
- 团队线: gray #94a3b8, 虚线

**关键词匹配** (`findAbilityValueByName` + `matchesKeyword`):
1. textLower.contains(dimLower) → 直接匹配
2. 去"能力""规范""遵守""性"后缀 → 再尝试包含匹配
3. 取前2字符尝试匹配

### API 3: 成长曲线 `GET /qualityStatistics/growth-curve`

**SQL**: 子查询去重 → `GROUP BY week_label (DATE_FORMAT → 'YYYY-Wxx')` → AVG(score) → ORDER BY week_label

**VO**: `GrowthCurveVO { xAxis: List<String>, scores: List<Double> }`

### API 4: 情绪-成交散点 `GET /qualityStatistics/emotion-scatter`

**SQL**: JOIN `td_voc_quality_detail` → GROUP BY user_id → COUNT(dt.id) AS negativeCount (X轴), AVG(r.score) AS avgScore (Y轴) → HAVING COUNT(dt.id) > 0 (只返回有违规记录的员工)

**VO**: `EmotionScatterVO { items: [{username, negativeCount, avgScore, deptName}] }`

### API 5: 销冠教材/案例库 `GET /qualityStatistics/top-cases`

**SQL**: FROM `td_case_detail cd` INNER JOIN `td_case_storage cs` LEFT JOIN `td_device_voc_record_combine c` LEFT JOIN `td_voc_quality_result q` LEFT JOIN `blade_dept d`
- `WHERE cd.status = 2 AND cd.is_deleted = 0` (status=1无数据，全部=2)
- tags来源: `COALESCE(q.title, cs.name)` (优先质检标题，兜底案例库名)
- 案例库仅 `onMounted` 调用一次，不随 period/dept 变化刷新

**VO**: `TopCaseVO { caseName, caseDesc, recommendReason, learnTimes, salesman, tags, deptName }`

---

## Tab5 大屏模式 (StatsScreen) — 未实现

**前端**: StatsScreen.vue (244行) — 全部 mock，每5秒模拟数据增长

**待实现**:
- 4 KPI 卡片 (当日探访/录音/质检分/转换率) — 复用现有 Mapper 缩短时间窗口为1天
- 双轴图表 (7日录音柱状+质检均分折线) — 前端合并两个现有 API 即可
- 实时事件流 — 轮询 violation-list 或 SSE 推送

---

## 数据表速查

### 核心表 (已使用)

| 表名 | 所属模块 | 使用API | 关键字段 |
|------|---------|:---:|---------|
| `td_device_voc_record_combine` | blade-device | T1全覆盖+趋势+明细, T3(待), T4案例 | id, start_time, end_time, user_id, username, dept_id, customer_id, url, voc_time, voc_time_str, title, customer_name |
| `td_device_voc_record` | blade-device | 备用 | id, deviceNo, userId, deptId, startTime, endTime, url, vocTime |
| `td_device_info` | blade-device | T1覆盖率, T4排名基表 | id, deviceNo, user_id, deviceStatus, lastHeat |
| `td_customer_info` | blade-device | T1明细, T3(待) | id, name, phone, tags, products |
| `td_case_storage` | blade-device | T4案例 | id, name, description |
| `td_case_detail` | blade-device | T4案例 | id, storage_id, voc_id, quality_id, reason, learn_times, status (全=2) |
| `td_voc_quality_result` | blade-quality | T1明细, T2全部, T4全部 | id, voc_record_id, user_id, username, score, abilities(JSON), voc_record_start_time, end_time, dept_id, model_id, title |
| `td_voc_quality_detail` | blade-quality | T2饼图+违规, T4散点 | id, quality_id, dim_name, reason, score, origin |
| `td_ai_quality_dimension` | blade-quality | T2雷达, T4雷达 | id, model_id, name, weight |
| `td_ai_quality_model` | blade-quality | 参考 | id, name, code, type, threshold |
| `blade_dept` | blade-system | T1趋势+明细, T2全部, T4排名+散点+案例 | id, dept_name, region_code, parent_id, is_deleted |
| `blade_user` | blade-system | T1覆盖率 | id, tenant_id, is_deleted |

### 待使用表 (Tab3)

| 表名 | 用途 | 当前数据量 |
|------|------|:---:|
| `td_voc_customer_analysis` | Tab3 气泡矩阵+触点时间线 | 12条 |
| `td_voc_customer_analysis_detail` | Tab3 词云/排名 | 50条 |
| `td_voc_common_analysis` | 覆盖率分子UNION | — |
| `td_voc_common_industry` | 覆盖率分子UNION | — |

### 关键 JOIN 关系

```
td_device_voc_record_combine (录音)
  │  id = voc_record_id
  ▼
td_voc_quality_result (质检结果)
  │  id = quality_id
  ▼
td_voc_quality_detail (扣分明细)
  │  dim_name → dim_id
  ▼
td_ai_quality_dimension (维度定义)

td_case_detail (案例明细)
  ├── storage_id → td_case_storage (案例库)
  ├── voc_id → td_device_voc_record_combine (录音)
  └── quality_id → td_voc_quality_result (质检结果)

blade_dept ← dept_id 关联以上各表
blade_user ← user_id 关联录音表/设备表
```

---

## 公共参数处理机制

| 参数 | 前端入口 | 后端处理 | 适用范围 |
|------|---------|---------|:---:|
| `period` | StatsView globalPeriod | day→7天, month→7月, year→3年 (趋势); day→当天, month→本月, year→今年 (覆盖率/摘要) | 全部API |
| `deptId/deptIds` | StatsView el-tree-select | resolvedDeptIds 递归收集子孙ID → 逗号分隔 → 后端拆分List → `IN (...)` | 全部API |
| `modelId` | Tab1/Tab4 el-select | 透传 Mapper XML | 覆盖率+质检统计 |
| `userId/userIds` | 前端 (目前UI未暴露) | 个人视角过滤 | 全部API |
| `tenantId` | JWT 自动 | 平台管理员(000000)→跳过; 其他→强制 `AND tenant_id = ?` | 全部API |

**deptId → deptIds 多部门支持**: DTO 中 `deptId` 类型从 `Long` 变为 `String` (兼容逗号分隔)，Service 层 `buildParams()` 拆分为 `List<Long> deptIdList`，Mapper XML 统一用 `<foreach collection="deptIdList">` 生成 `IN (...)`。

---

## 关键设计决策

1. **代码放 blade-record**: Mapper XML 跨库查询 blade-device/blade-quality 表，自建 VO 映射，不依赖 blade-quality 模块
2. **质检去重**: 所有 score 统计用 `WHERE id IN (SELECT MAX(id) GROUP BY voc_record_id)` — 避免同一录音多次质检拉偏均值
3. **abilities JSON 解析**: 取原始字符串到 Java 层用 fastjson 多策略 key 匹配，避免 SQL JSON_EXTRACT 中文引号问题。实际格式为 `{"items":[{criterion, score}]}` 数组
4. **branch→deptId 映射**: 优先 region_code LIKE，降级 dept_name 模糊匹配
5. **排名基表修复**: `selectStaffRanking` 从直接查 `td_voc_quality_result` 改为以 `td_device_info` 为基表 LEFT JOIN，确保工牌绑定用户全覆盖
6. **时间过滤统一**: 质检统计用 `COALESCE(voc_record_start_time, end_time)` 兜底 + `end_time` 过滤 (通话时间语义)，录音趋势用 `start_time` 过滤
7. **趋势 pivot**: SQL 返回扁平列表，Java 层做行列转换 + `generateFullXAxis` 补全无数据日期
8. **Nacos 多实例问题**: vite 代理直连 localhost:8204 绕过网关轮询
9. **竞态保护**: `watchEpoch` 计数器，每个 `await` 后校验，过期直接 return

---

## 修复时间线

### 2026-06-24 (初始实现)
- Tab1+Tab2 后端 14 文件 + 前端 3 文件改造完成
- 7 个 API 全部可用
- 修复: MQTT 日志抑制、Nacos 代理绕过、timeRange 默认 90days

### 2026-06-25 (Period 重构 + 效率 Widget)
- 删除日期选择器，全局 period 按钮 (按日/按月/按年) 控制所有子组件
- Widget1 模型覆盖率 (4表UNION) + Widget2 动态部门趋势线
- xAxis 完整时间轴填零 + 按年扩展到近3年 + 摘要卡片 (客户总数/转写总量+环比)
- 质检趋势 SQL 用 `COALESCE(voc_record_start_time, end_time)` 兜底

### 2026-06-26 (趋势图 8 项修复)
1. SQL 上界 `end_time` → `start_time` (进行中录音不被排除)
2. 摘要卡片传 deptIds，部门联动
3. 覆盖率全栈加 deptIds (分母 JOIN blade_user，分子 4 UNION 加 foreach)
4. 竞态保护 `watchEpoch`
5. 月模式跨年标签歧义: `%m月` → `%Y-%m月`
6. GROUP BY 加 `dept_id` 防止同名部门合并
7. deptId → deptIds (多部门支持)

### 2026-06-26 (Tab4 实现 + 6项修复)
- Tab4 5 个 API 全部实现: 排名/雷达/成长曲线/情绪散点/销冠案例
- #1 案例库 status=1→2 (全=2)
- #2 全局 `end_time` → `voc_record_start_time` (14处 WHERE)
- #3 雷达维度语义匹配 (拆词关键词)
- #4 SOP率 -1% → 显示 "—" (sopRate=null + 前端防御判断)
- #5 Tab4 时间参数 (新增 timeParams computed, 案例库不传时间)
- #6 案例 tags: `c.title` → `COALESCE(q.title, cs.name)`

### 2026-06-29 (Git 拉取回退修复)
- 同事推送全局 `end_time→start_time` 替换 + `selectStaffRanking` 重写 (直接查质检表)
- 恢复 `selectStaffRanking` 为 `td_device_info` 基表 LEFT JOIN
- 5个Tab4关键SQL添加 `COALESCE(start_time, end_time)` 防止NULL数据断流
- 保留同事的新增功能: `deductionDistribution` / `parentDeptId` / `modelId`

---

## 已知问题清单

### 🔴 高优先级
1. **-1分问题**: 无质检记录用户 (赵六/管理员/张三等7人) 显示 `-1分` 而非 `—`，SQL正确返回 NULL，疑为 MyBatis→Jackson 序列化链路或前端 mock fallback 触发
2. **isIndividual 硬编码**: StatsPerformance.vue:380,396 硬编码 `'陈伟东'`，应改用 `props.selectedUserIds`
3. **selectRadarDimensions 无租户隔离**: 取"最常用模型"跨全部租户，内层和外层查询都需加 `AND tenant_id = #{tenantId}`

### 🟡 中优先级
4. **时间字段不一致**: `selectAvgScore` / `selectLowestScoreRecord` / `selectScoreGroupByDept` / `selectScoreGroupByUser` 仍用 `voc_record_start_time`，与实际通话时间语义不一致
5. **时间窗口边界**: `new Date()` 取当前秒，当天晚些记录被排除，end time 应为 `23:59:59`
6. **sopRate 永远为 null**: 排名榜 SOP率全显示 "—"，需从 abilities JSON 解析 SOP 规范维度均分
7. **fetchGrowthCurve/EmotionScatter 缺 modelId+deptId**: 切换模型/部门后图表不联动
8. **fetchTopCases 空参数 `{}`**: 销冠教材不受任何筛选影响
9. **selectAllAbilities 无时间过滤+无LIMIT**: 全局基线用全量历史数据，与个人时间范围不对等，大数据量 OOM 风险
10. **COALESCE(r.end_time, r.end_time) 无意义**: 直接写 `r.end_time`
11. **StatsInsights/Performance props 不匹配**: StatsView 传 `selectedDeptId/userIds`，但子组件使用 `timeRange/branch/searchEmployee`

### 🟢 低优先级
12. Fetch 链竞态条件: `fetchStaffRanking` 内不 await 子请求
13. `selectedUserIds` prop 完全未使用
14. 参数名不一致: `deptId` vs `deptIds`
15. `fetchModels` 静默吞错
16. FastJSON + Jackson 混用 (FastJSON 有历史 RCE CVE)
17. `toDouble()` 可抛未捕获异常
18. `growthCurve()` 潜在 NPE (rows 可能为 null)
19. `onDrilldown`/`onExport` 死代码
20. 雷达 API 两次调用可 `Promise.all` 并行
21. 魔法数字: 7天/7月/3年硬编码
22. 模型列表混入非质检模型 (需前端过滤 type)
23. 录音明细表硬编码 mock (需单独后端 API)

---

## 关联记忆

- [[checkin-feature-v3-complete]] — 打卡功能 (销冠教材的另一应用场景)
- [[bladex-backend-overview]] — BladeX 后端架构
- [[saber3-frontend-overview]] — Saber3 前端
- [[aiai2-smart-badge-ai-platform]] — AI 工牌原型 (StatsView 原始来源)
- [[tenant-id-multi-tenant-system]] — 多租户隔离机制
- [[smart-badge-platform-user-manual]] — 平台使用手册
- [[voiceprint-skip-unregistered-optimization]] — 声纹匹配优化
- [[customer-360-profile]] — 客户360°全景画像
- [[real-audio-player]] — 真实音频播放器

---

## 2026-06-30 新增与修复

### Tab4 三图表 ECharts 改造
- 成长曲线：裸 SVG → ECharts 折线图（smooth+渐变填充+80分优秀线）
- 情绪散点：CSS absolute div → ECharts scatter（X=负面词/Y=质检分，绿蓝红分色）
- 销冠案例：Tailwind 卡片 → ECharts 横向柱状图（学习次数排行，tooltip 含完整案例信息）
- 成长曲线横坐标从写死 `%Y-W%v` 改为按 `<choose dateFormat>` 跟随 period：`%m-%d` / `%m月` / `%Y年`
- **零值补全**：ServiceImpl 参照趋势图的 `generateFullXAxis`，无数据日期自动填 0.0
- 周标签 `2026-W22` → `5/25-5/31` 日期范围（后发现 SQL 里 `W` 是硬编码字母，改为 SQL 层按 period 输出正确格式）

### -1分 问题
- **根因**：FastJSON 序列化将 null Double → -1（非 Jackson，`@JsonInclude` 无效）
- **修复**：前端兜底 `st.avgScore != null && st.avgScore >= 0 ? st.avgScore : '—'`
- **后端**：`StaffRankingVO` 加 `@JsonInclude(NON_NULL)`（无效但无害）+ ServiceImpl `totalCount=0` 时置 null
- sopRate 同理：前端 `>= 0` 判断，后端始终置 null

### 客户 360° 全景画像（Tab3 StatsInsights 内嵌）
- **后端**：`CustomerProfileVO`（含 TimelineEvent）+ `GET /customer-profile` + `GET /customer-list`
- **SQL**：三表 JOIN `td_customer_info` + `td_device_voc_record_combine` + `td_voc_quality_result` + `td_voc_customer_analysis`
- **意向判定**：关键词匹配（明确/强烈/成交→高，关注/犹豫→中）
- **风险判定**：`need_follow_up` = "是" → 高风险
- **关注商品**：全部 `product_list` 逗号拆分去重聚合
- **前端**：接在 StatsInsights.vue 原有 mock 框架上，加 `el-select` 客户下拉，替换 mock 为真实 API 数据
- **"评估预算级别" → "关注商品"**：用 `p.products` 展示客服关心的商品名

### 真实音频播放器
- 替换 StatsView 底部模拟波形为 `<audio controls>` 真实 HTML5 播放器
- GET `/blade-device/deviceVocRecord/play?path=xxx.mp3` → blob → `URL.createObjectURL()` → `audio.src`
- 点击溯源按钮自动播放（`audioRef.value.play()`）
- 关闭时暂停音频并释放 blob URL（`revokeObjectURL`）

### 同事代码拉取回退修复（同日）
- `selectCaseDetailList` status=2 → 1 回退，恢复为 2
- `RecordApplication` 应用名 +"zj" 后缀，去掉
- `statistics.js` `extra = '/blade-recordzj'`，恢复为 `/blade-record`

### 2026-06-30 Tab3 客户洞察溯源按钮修复

**问题**：StatsInsights.vue 点击 Timeline 中"溯源该时段现场原始录音声轨"时，只在内嵌音频播放器播放，不跳转到录音分析详情页。

**修复**：`StatsInsights.vue` — 修改 `onDrilldown` 方法：
- Before: `emit('drilldown', recId, audioUrl, desc)` → StatsView 内嵌播放
- After: `router.push({ path: '/quality/analysisDetail', query: { id: recId, data: btoa(JSON.stringify({...})) } })` → 直接跳转详情页
- 新增 `import { useRouter } from 'vue-router'` 和 `const router = useRouter()`
- 去掉 `data` 中的 `deptId` 字段（逗号分隔多值导致 analysisDetail 页 `Long.parseLong` 报错）

**关联故障**：同一天 Redis ProtoStuff 反序列化导致 500（[[redis-protoStuff-deserialize-fix]]），与 StatsInsights 修复无关，是独立问题。
