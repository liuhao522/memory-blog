---
name: redis-protostuff-deserialize-fix
description: Redis ProtoStuff反序列化故障排查 — Dept缓存损坏导致录音页面500 · 不同账号不同表现 · 修复方案
metadata: 
  node_type: memory
  type: reference
  tech: 
    - ProtoStuff 1.8.0
    - Redis (Spring Data Redis 3.2.12)
    - BladeX 4.6.0 (blade-starter-redis)
    - Java Protobuf serialization
  date: 2026-06-30
  severity: high
  affected: 
    - /api/blade-device/deviceVocRecord/page
    - /api/blade-device/deviceVocRecordCombine/page
    - 所有调用 DeptAuthUtil.preAuth() 的接口
  originSessionId: e724fd70-08bd-4459-89c1-c8cfc847ba85
---

# Redis ProtoStuff 反序列化故障

## 故障现象

访问录音列表/录音合并页面时返回 HTTP 500：

```json
{"code": 500, "msg": "Reading from a byte array threw an IOException (should never happen)."}
```

## 完整调用链

```
HTTP GET /api/blade-device/deviceVocRecordCombine/page
  → DeviceVocRecordCombineController.page()
    → DeviceVocRecordCombineServiceImpl.selectDeviceVocRecordCombinePage()
      → DeptAuthUtil.preAuth(params)           // DeptAuthUtil.java:36
        → SysCache.getDept(deptId)             // SysCache.java:103
          → CacheUtil.get(SYS_CACHE, DEPT_ID, id, ...)
            → RedisCache.lookup()
              → ProtoStuffSerializer.deserialize()
                → ProtobufIOUtil.mergeFrom()
                  → 🔥 ProtobufException: invalid tag (zero)
```

## 根因

**ProtoStuff 从 Redis 反序列化 Dept 对象时失败**，原因是：

1. `Dept` 实体类在某个时间点发生过字段变更（增删字段、变更类型等）
2. 变更前序列化存入 Redis 的旧 Dept 对象，使用的 Protobuf schema 与新代码不匹配
3. ProtoStuff 读到不认识的 wire tag=0 时抛 `ProtobufException: invalid tag (zero)`，被包装为 RuntimeException

**关键代码** — `DeptAuthUtil.preAuth()` 第 36 行：

```java
Dept dept = SysCache.getDept(deptId);  // deptId 来自 JWT token 的 dept_id
```

## 为什么不同账号表现不同

| 账号 | dept_id | Redis 缓存状态 | 结果 |
|------|---------|---------------|------|
| 云南分公司管理员 | 租户下属部门ID | 类变更后写入 → 新版序列化 | ✅ 正常 |
| 管理组管理员(admin) | 1123598813738675201 | 系统初始化时写入 → 旧版序列化 | ❌ 500 |

`1123598813738675201` 是 tenant_id=000000 的根部门，大概率系统初始化时就创建并缓存了。类变更后从未被驱逐重写，一直保持旧版本序列化数据。

## 修复

### 临时修复（立即生效）

```bash
# 精确清理
redis-cli DEL dept:id:1123598813738675201
redis-cli DEL deptChild:id:1123598813738675201
redis-cli DEL deptChildIds:id:1123598813738675201
redis-cli DEL deptName:id:1123598813738675201

# 或全量清理部门缓存
redis-cli KEYS "*dept*" | xargs redis-cli DEL
```

清完后系统从 MySQL 重新加载 → 用当前版本 ProtoStuff 序列化写入 Redis → 问题消失。

### 永久方案

1. **改实体类后自动清缓存**：部署脚本加 `redis-cli KEYS "*dept*" | xargs redis-cli DEL`
2. **缓存 key 加版本号**：`dept:id:v2:{id}`，类结构变更时升级版本号
3. **换序列化方案**：ProtoStuff 对类变更敏感，可考虑换 Jackson JSON 序列化（牺牲一点性能换兼容性）

## 受影响范围

所有调用 `DeptAuthUtil.preAuth()` 的 Service：
- `DeviceVocRecordServiceImpl.selectDeviceVocRecordPage`
- `DeviceVocRecordCombineServiceImpl.selectDeviceVocRecordCombinePage`
- 以及 blade-device 模块下所有走部门权限校验的接口

## 关联记忆

- [[stats-dashboard]] — 统计大屏，其 Tab3 (StatsInsights) 溯源按钮修复在同一 session
- [[bladex-platform]] — BladeX 架构（Redis 配置、缓存体系）
- [[smart-badge-platform-user-manual]] — 平台模块总览
