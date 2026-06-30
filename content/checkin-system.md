---
name: checkin-system
description: 工牌打卡系统完整知识图谱 — v3最新架构、打卡点管理、批量导入、自动匹配、监控、使用手册
metadata: 
  node_type: memory
  type: project
  tech: 
    - Java 17
    - Spring Boot 3.2
    - MyBatis-Plus
    - Vue 3
    - Element Plus
    - Avue
    - AMap JS API 2.0
    - BladeX 4.6.0
    - Saber3 4.6.0
  date: 2026-06-29
  originSessionId: 9f146a9e-ef34-40ba-b7de-dedc6a30735c
---

# 打卡系统知识图谱

## 一、版本演进

| 版本 | 日期 | 核心变化 |
|------|------|----------|
| **v1** | 2026-06-05 | 初始实现：打卡任务(时间窗口)、Haversine判定、60s定时检测、监控大屏。手动地图选点创建，无批量导入。 |
| **v2** | 2026-06-08 | 设计方案(已废弃)：打卡任务→打卡点、启用/停用替代时间窗口、Excel批量导入+前端AMap自动地理编码(POI优先)、问题清单页。仅地址匹配逻辑被v3采纳。 |
| **v3** | 2026-06-09 | **当前版本**：整合v1+v2，双模式兼容(无时间→启用/停用，有时间→启动/结束)、Excel批量导入+自动坐标匹配(前端AMap POI+Geocoder)、问题打卡点页、实时检测(设备GPS到达时即时判定，不再依赖60s轮询)。 |

---

## 二、v3 架构（当前版本）

### 2.1 核心功能

1. **打卡点管理**: 手动创建(地图选点) + Excel批量导入
2. **地理编码**: 导入时前端 AMap 自动匹配(POI优先+Geocoder精修)，失败的不重试，可在问题页手动修复
3. **双模式管控**: 无时间窗口→启用/停用, 有时间窗口→启动/结束(兼容旧数据)
4. **实时检测**: 设备GPS数据到达时即时触发(`DeviceEventListener` → `CheckinDetectionService.detect()`)，Haversine判定+停留时长
5. **实时监控大屏**: 设备树(按部门分组/4色标记)+AMap地图+状态表, 30秒刷新
6. **打卡记录**: 自动记录, 支持查询导出

### 2.2 数据库

- `td_device_checkin_task`: 打卡点表
  - 字段: taskName, longitude, latitude, radius, startTime, endTime, minStayDuration, deptId, status, province, city, district, address, geocodeStatus, geocodeMsg
  - 继承 TenantEntity (tenant_id 多租户隔离)
  - status 枚举: 0=停用/未开始, 1=启用/进行中, 2=已结束
  - geocodeStatus 枚举: 0=导入成功, 1=待处理, 2=已手动修复
  - 关键变更: longitude/latitude/start_time/end_time 可 NULL

- `td_device_checkin_record`: 打卡记录表
  - 字段: taskId, deviceNo, userId, username, checkinTime, stayDuration, checkinLongitude, checkinLatitude, status
  - status 枚举: 0=未打卡, 1=已打卡
  - 实时状态枚举(非DB字段): CHECKED_IN(已打卡), STAYING(停留中), NOT_AT_POINT(未打卡), OFFLINE(离线)

### 2.3 后端文件清单 (包: org.springblade.device)

| 文件 | 说明 |
|------|------|
| `pojo/entity/DeviceCheckinTaskEntity.java` | 打卡点实体, STATUS_DISABLED=0/ENABLED=1/PENDING=0/ACTIVE=1/ENDED=2, GEOCODE_SUCCESS=0/PENDING=1/MANUAL=2, 含 province/city/district/address/geocodeStatus/geocodeMsg |
| `pojo/entity/DeviceCheckinRecordEntity.java` | 打卡记录实体, STATUS_UNCHECKED=0/CHECKED=1, 实时枚举 CHECKED_IN/STAYING/NOT_AT_POINT/OFFLINE |
| `pojo/dto/CheckinStatusDTO.java` | 实时状态 DTO, 含 deptName |
| `pojo/vo/DeviceCheckinTaskVO.java` | VO 加了 deptName 字段 |
| `wrapper/DeviceCheckinTaskWrapper.java` | entityVO() 中填充 deptName(SysCache), null/≤0→"全部部门" |
| `controller/DeviceCheckinTaskController.java` | 18个接口: CRUD + start/end(旧) + active + import-checkin + export-template + problems + fix-coordinate(isManual) + mark-failed + toggle |
| `controller/DeviceCheckinRecordController.java` | CRUD + /status(核心,实时打卡状态) |
| `service/impl/DeviceCheckinTaskServiceImpl.java` | importCheckinTask(跳过空行/覆盖模式) + getProblems(geocodeStatus=1) + fixCoordinate(isManual区分0/2) + markGeocodeFailed + toggleStatus |
| `service/impl/DeviceCheckinRecordServiceImpl.java` | getCheckinStatus(查任务→设备→记录→Haversine判定4状态) + deptName 填充 + deptId>0过滤 |
| `schedule/CheckinDetectionScheduler.java` | @Scheduled 60s, 查 STATUS_ENABLED 兼容无/有时间窗口, 自动结束过期任务 |
| `excel/DeviceCheckinTaskImportExcel.java` | 7列模板: 省/市/区/打卡点/半径/停留/部门 |
| `excel/DeviceCheckinTaskImporter.java` | 实现 ExcelImporter |
| `excel/DeviceCheckinTaskExcel.java` | 导出模型, 含 province/city/district/geocodeStatus |
| `excel/ExcelDropDownWriteHandler.java` | EasyExcel 下拉处理器(备用,当前未启用) |

### 2.4 前端文件清单 (D:\voice\saber3\src)

| 文件 | 说明 |
|------|------|
| `api/device/deviceCheckinTask.js` | getList/detail/remove/add/update/start/end/getActive/importCheckin/getProblems/fixCoordinate/markFailed/toggle |
| `api/device/deviceCheckinRecord.js` | getList/detail/remove/add/update/getStatus |
| `option/device/deviceCheckinTask.js` | 列定义: 打卡点/省/市/区/坐标/半径/时间/停留/适用部门(deptName)/地理编码(导入成功/待处理/已修复)/状态(停用/启用/已结束)/操作, menu:false viewBtn:false |
| `option/device/deviceCheckinRecord.js` | 列定义: 任务ID/设备/姓名/打卡时间/停留/坐标/状态 |
| `views/device/deviceCheckinTask.vue` | 主页面: 新增/导入/删除/导出/问题徽标, 操作列(双模式), 自定义弹窗(地图选点+城市区县+POI搜索+Geocoder精修), 批量导入弹窗, 匹配进度弹窗, 自动批量匹配(freshPoints过滤/markFailed标记/10s超时/400ms间隔) |
| `views/device/deviceCheckinTaskProblem.vue` | 问题页: 待处理列表 + 重新匹配(地图选点+搜索) + 手动保存(isManual=true) |
| `views/device/checkinMonitor.vue` | 监控大屏: 设备树(按部门分组/4色标记) + AMap地图 + 状态表, 30秒自动刷新 |

### 2.5 关键 API

| 方法 | URL | 说明 |
|------|-----|------|
| POST | `/import-checkin?isCovered=` | 批量导入(String类型, "1"/"true"=覆盖) |
| GET | `/export-template` | 下载模板 |
| GET | `/problems` | 查询待处理点(geocodeStatus=1) |
| PUT | `/fix-coordinate?id=&longitude=&latitude=&isManual=` | 修正坐标 |
| PUT | `/mark-failed?id=&reason=` | 标记失败(不再自动重试) |
| PUT | `/toggle?id=` | 切换启用/停用 |
| GET | `/active` | 启用中的点(供监控下拉) |
| GET | `/status?taskId=` | 实时打卡状态(核心) |
| POST | `/start?id=` | 启动任务(旧时间窗口模式) |
| POST | `/end?id=` | 结束任务(旧时间窗口模式) |

### 2.6 数据流

```
Excel导入 → 后端保存(status=0, geocodeStatus=1, geocodeMsg=null)
  → 前端批量匹配(freshPoints=p.filter(!p.geocodeMsg))
    → 成功: fixCoordinate(isManual=false) → geocodeStatus=0
    → 失败: markFailed → geocodeMsg="原因", 不再自动重试
  → 进度圈加载弹窗 → 结果对话框 → 自动刷新
  → 失败的点 → [⚠问题打卡点] → 手动修复 → fixCoordinate(isManual=true) → geocodeStatus=2

手动创建 → 地图选点 → 反地理编码自动填充省/市/区 → 保存(status=停用)

启用(status=1) → 设备GPS到达 → DeviceEventListener(GPS_HEART) → CheckinDetectionService.detect()
  → 校验设备在线且有GPS → 查询同租户所有启用打卡点 → 部门过滤 → 已打卡跳过
  → Haversine距离判定 → 查询minStayDuration秒内GPS日志 → 所有点都在半径内 → 打卡成功
  → td_device_checkin_record 写入 → 监控大屏实时更新
```

### 2.7 状态码速查

**打卡点状态 (status)**
| 值 | 含义 | 说明 |
|----|------|------|
| 0 | 停用/未开始 | 不会被调度器检测 |
| 1 | 启用/进行中 | 会被检测，监控页可查 |
| 2 | 已结束 | 不再检测（仅时间窗口模式使用） |

**地理编码状态 (geocodeStatus)**
| 值 | 含义 | 说明 |
|----|------|------|
| 0 | 导入成功 | 坐标已自动匹配 |
| 1 | 待处理 | 需要手动修复（显示在问题页） |
| 2 | 已手动修复 | 用户已手动修正坐标 |

**打卡记录状态**
| 值 | 含义 |
|----|------|
| 0 | 未打卡 |
| 1 | 已打卡 |

**实时状态枚举**
| 状态 | 含义 | 判定条件 |
|------|------|----------|
| CHECKED_IN | 已打卡 | 已在 td_device_checkin_record 中有 status=1 的记录 |
| STAYING | 停留中 | 距离 ≤ 半径 且 停留时间 < minStayDuration |
| NOT_AT_POINT | 未打卡 | 距离 > 半径 |
| OFFLINE | 离线 | deviceStatus=0 或 坐标为空 |

### 2.8 页面路由

| 页面 | 路由 | 用途 |
|------|------|------|
| 打卡点管理 | `/device/deviceCheckinTask` | 创建、导入、编辑、删除打卡点 |
| 问题打卡点 | `/device/deviceCheckinTaskProblem` | 手动修复导入失败的打卡点坐标 |
| 打卡记录 | `/device/deviceCheckinRecord` | 查看所有打卡记录 |
| 实时监控 | `/device/checkinMonitor?taskId=` | 大屏实时监控打卡进度 |

---

## 三、使用手册

### 3.1 完整操作流程

**方式一：手动创建**
```
1. 进入 打卡点管理 → 点击[新增打卡点]
2. 输入打卡点名称
3. 选填限定部门
4. 在地图上点击选择打卡位置（或搜索地标定位）
5. 调整半径（默认100m）
6. 设置时间范围或有效时长
7. 调整最少停留秒数（默认120s）
8. 点击[创建任务] → 保存，状态默认为启用
```

**方式二：Excel 批量导入**
```
1. 点击[批量导入] → 下载模板（Excel: 省/市/区/打卡点名称/允许半径(米)/最少停留(秒)/适用部门）
2. 填写数据后上传，选择是否[数据覆盖]（覆盖：按打卡点名称匹配已有记录更新）
3. 上传成功 → 自动关闭导入弹窗 → 自动弹出"正在匹配坐标"进度弹窗
4. AMap 逐个匹配（POI优先 → Geocoder兜底，每点间隔 400ms，超时 10s）
5. 匹配成功 → fixCoordinate(isManual=false) → geocodeStatus=0
6. 匹配失败 → markFailed(reason) → geocodeMsg 记录原因
7. 完成后弹出结果对话框，失败的可直接跳转问题页处理
8. 回到列表，对需要启用的点点击[启用]（导入后默认 status=0 停用）
```

**员工打卡（自动）**
```
员工携带工牌到达打卡点附近 → 工牌设备上报GPS数据 → 系统实时检测距离和停留时间 → 满足条件后自动写入打卡记录 → 监控大屏状态变为"已打卡"
```

**实时监控**
```
1. 进入实时监控页面（或从打卡点列表点击[监控]按钮）
2. 选择进行中的打卡点
3. 观察左侧设备树状态颜色（✅已打卡/🟡停留中/🔴未打卡/⚫离线）
4. 点击设备查看地图位置
5. 30秒自动刷新，无需手动操作
```

### 3.2 监控大屏布局

- **左侧 (260px)**: 设备树 — 按部门分组树形展示，4色标记，搜索框过滤姓名/设备号，点击节点→地图定位
- **中间**: AMap地图 — 打卡点(红色标记+半径圈)，设备彩色圆点散布，点击弹出信息窗(姓名/设备号/状态/停留时长/距离/打卡时间)
- **右侧 (380px)**: 状态明细表 — 姓名/设备号/状态标签/停留时长/距离，顶部统计已打X/总数Y，30秒自动刷新倒计时

### 3.3 FAQ

**Q1: 导入的打卡点为什么不生效？**
A: 导入后默认 `status=0(停用)`，需要在列表点击「启用」按钮。另外检查坐标是否已匹配成功（地理编码状态为「导入成功」或「已修复」）。

**Q2: 为什么有的打卡点坐标匹配失败？**
A: 可能原因：Excel中地址名称在AMap中找不到→去问题页手动修复；搜索关键词不够精确→补充城市和区县字段；高德API限流→重试即可(系统已做400ms间隔+10s超时保护)。

**Q3: 员工一直在打卡点附近但没打卡？**
A: 检查：打卡点status=1(启用)，设备在线且有GPS(deviceStatus≠0)，距离≤半径，停留时间≥minStayDuration，该设备未打过卡(不重复打卡)，如有限定部门需匹配。

**Q4: 如何查看某个设备是否打过卡？**
A: 进入「打卡记录」页，按设备编号或姓名搜索。

**Q5: 监控大屏为什么没有设备？**
A: 确认选择了进行中的打卡点(下拉来自 `/active` 接口，只返回status=1的点)，确认租户下有绑定用户的设备，如打卡点有限定部门只显示该部门设备。

**Q6: 覆盖模式导入是什么意思？**
A: 开启「数据覆盖」后，导入时Excel中打卡点名称与已有记录匹配则**更新**而非新增。关闭则始终新增。

**Q7: 编辑打卡点能否修改坐标？**
A: 可以。编辑弹窗同样包含地图，可重新搜索地标或点击地图修改坐标。

### 3.4 注意事项

1. **坐标系统**: 数据库存储 WGS-84，前端显示 GCJ-02(高德坐标系)，`transformFromWGSToGCJ`/`transformFromGCJToWGS` 负责转换
2. **多租户**: 打卡点和记录基于 `TenantEntity`，自动按 `tenant_id` 隔离
3. **双模式兼容**: 无时间窗口→启用/停用，有时间窗口→启动/结束，调度器兼容两种
4. **实时检测**: 设备GPS到达时即时触发(DeviceEventListener监听GPS_HEART→CheckinDetectionService.detect())，不再依赖60s定时轮询
5. **权限**: 导出接口需 `@IsAdmin`；Avue中 `menu` 是保留关键字，自定义列名须用 `operation`
6. **删除**: BladeX 逻辑删除机制（`is_deleted` 字段标记）
7. **地图搜索**: POI优先(PlaceSearch) → Geocoder兜底，配合城市/区县输入提升精度

---

## 四、关联记忆

- [[bladex-backend-overview]] — BladeX 后端架构
- [[saber3-frontend-overview]] — Saber3 前端架构
- [[tenant-id-multi-tenant-system]] — 多租户数据隔离机制
- [[smart-badge-platform-user-manual]] — 智慧工牌平台完整使用手册
- [[stats-dashboard-full-status-report]] — 统计大屏现状报告
