---
name: checkin-system
description: GPS 打卡系统从 60 秒轮询到事件驱动实时检测的三次架构演进 — Haversine 地理围栏、Excel 批量导入、AMap 自动编码
metadata:
  node_type: memory
  type: project
  featured: true
  highlight: "v1→v3架构演进：从60s轮询到实时事件驱动，Haversine地理围栏"
  tech:
    - Java 17
    - Spring Boot 3.2
    - MyBatis-Plus
    - Vue 3
    - AMap JS API 2.0
    - BladeX 4.6.0
  date: 2026-06-29
---

# GPS 打卡系统 v1→v3：从 60 秒轮询到事件驱动的架构演进

> 智慧工牌平台需要一套自动打卡系统——员工携带工牌进入打卡点范围后自动记录。听起来简单，但从 60 秒定时轮询到 GPS 事件驱动、从手动创建到 Excel 批量导入、从假数据监控到实时大屏，这个系统经历了三次重构。

## v1（6/5）：能用就行

第一版只解决核心问题：给定坐标和半径，判断设备是否在范围内。

### Haversine 距离公式

```java
double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
double distance = 6371 * c * 1000; // 米
```

公式本身没问题，问题在**何时调用**。

### 60 秒定时检测

v1 的触发机制是一个 `@Scheduled(fixedRate = 60000)` 注解：

```java
@Scheduled(fixedRate = 60000)
public void detect() {
    List<Device> devices = getAllOnlineDevices();
    for (Device device : devices) {
        for (CheckinTask task : getActiveTasks()) {
            if (isInRange(device, task) && hasStayed(device, task)) {
                createRecord(device, task);
            }
        }
    }
}
```

**问题**：
- 60 秒粒度太粗：员工可能在第 5 秒进入、第 25 秒离开，错过检测窗口
- 无差别轮询：凌晨没员工也在全量遍历
- 无法区分"停留中"和"已打卡"：监控大屏只能盲猜

但 v1 只是 POC，够用了。

## v2（6/8）：批量导入的工程化尝试

v2 聚焦于运营效率——市场部要导入 200 个门店作为打卡点，手动创建不可行。

### Excel 批量导入 + AMap 自动编码

设计了一套完整的导入流程：

```
Excel（省/市/区/打卡点名/半径/停留秒数/部门）
  → 后端保存（status=0 停用, geocodeStatus=1 待处理）
    → 前端逐个调用 AMap 地理编码
      → 成功：fixCoordinate() → geocodeStatus=0
      → 失败：markFailed() → 不自动重试
```

### 关键设计：失败不重试，不阻塞

地理编码失败的不会自动重试。为什么？因为失败通常是地址本身有问题（如"XX路交叉口"这种模糊地址），重试只是浪费 API 配额。失败的打卡点会进入「问题打卡点」页面，由运营手动在地图上选点修正。

v2 还做了个设计——用「启用/停用」替代 v1 的时间窗口模式。但 v2 没来得及完全实现。

## v3（6/9）：事件驱动的实时检测

v3 整合了 v1+v2，并做了一个关键升级：**从定时轮询改为事件驱动**。

### 核心改进：DeviceEventListener

工牌设备每 30 秒上报一次 GPS 心跳。v3 不再被动等待 60 秒定时器，而是在每次 GPS 数据到达时即时触发检测：

```java
// DeviceEventListener 监听 GPS_HEART 事件
public void onGpsHeartbeat(DeviceGpsEvent event) {
    checkinDetectionService.detect(event.getDeviceNo(), event.getLat(), event.getLng());
}
```

`CheckinDetectionService.detect()` 的判定逻辑：

1. 设备在线且有 GPS → 继续
2. 查询同租户所有启用打卡点 → 部门过滤 → 已打卡跳过
3. Haversine 距离判定 → 在半径内？
4. 查询最近 N 秒 GPS 日志 → 所有点都在半径内？
5. 满足停留时长 → 打卡成功，写入 `td_device_checkin_record`

### 为什么要查"最近 N 秒所有 GPS 点"？

单一 GPS 点可能在半径内只是路过。要求最近 `minStayDuration` 秒内的所有 GPS 上报点都在半径内，才算真正"停留"了。

### 双模式兼容

v3 兼容两种状态控制：
- **启用/停用**（新）：无时间窗口，手动切换
- **启动/结束**（旧）：有时间窗口，兼容 v1 数据

调度器兼容两种模式，自动结束过期的时间窗口任务。

## 监控大屏：30 秒刷新的实时战场

监控大屏是打卡系统最直观的产出。三栏布局：

- **左栏（260px）**：设备树，按部门分组，4 色标记（✅已打卡 🟡停留中 🔴未打卡 ⚫离线）
- **中栏**：AMap 地图，红色标记=打卡点+半径圈，彩色圆点=设备实时位置
- **右栏（380px）**：状态明细表，顶部统计"已打 X/总数 Y"

关键设计决策：**不依赖 WebSocket 推送，用 30 秒轮询**。因为 GPS 心跳本身就是 30 秒一次，轮询频率与数据产生频率匹配，没有额外延迟。

## 踩过的坑

### 1. 坐标系统不一致

数据库存 WGS-84（GPS 原始坐标），前端用 GCJ-02（高德坐标系）。如果忘记转换，打卡点在地图上会偏移 300-500 米。需要在 API 层统一做 `transformFromWGSToGCJ` / `transformFromGCJToWGS`。

### 2. 导入后打卡点不生效

导入默认 `status=0`（停用），运营经常忘记手动启用。后续增加了导入成功后的提示："已导入 N 个打卡点，当前均为停用状态，请手动启用。"

### 3. 覆盖模式的语义歧义

`isCovered=true` 时按打卡点名称匹配已有记录更新。但 Excel 里两个同名"前台"会导致第二次导入覆盖第一次，而用户期望的是两行分别更新。需要在模板说明里强调"打卡点名称必须唯一"。

### 4. AMap API 限流

批量导入 200 个点时，AMap 的 QPS 限制导致部分请求失败。解决方案：400ms 间隔 + 10s 超时保护。失败的进问题页手动处理。

## 数据模型演进

v1 到 v3 最大的表结构变化是字段可 NULL 化：

```sql
-- v3: longitude/latitude/start_time/end_time 全部允许 NULL
-- 原因：地理编码失败的打卡点暂存，等手动修复坐标
-- 时间窗口不再是必填，启用/停用替代
```

`geocodeStatus` 三态：0=导入成功, 1=待处理, 2=已手动修复。区分"自动匹配"和"人工修正"对运营回溯很重要。

## 如果重来一次

1. **GPS 事件驱动从 v1 就做**：60 秒轮询是个偷懒的选择，v3 事件驱动只需要多写一个 Listener
2. **坐标转换集中在后端**：前端地图组件多的时候，统一在后端返回 GCJ-02，避免分散转换
3. **批量导入加 dry-run 预览**：让用户看到匹配结果再确认导入，而不是导入后去问题页修
