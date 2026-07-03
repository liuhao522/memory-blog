---
name: redis-protostuff-deserialize-fix
description: Redis ProtoStuff 反序列化故障的 7 层调用链排查 — 为什么不同账号看到不同的结果？跨租户缓存污染的完整诊断与修复
metadata:
  node_type: memory
  type: reference
  featured: true
  highlight: "7层调用链追踪，定位跨租户ProtoBuf序列化缓存污染"
  tech:
    - ProtoStuff 1.8.0
    - Redis (Spring Data Redis 3.2.12)
    - BladeX 4.6.0
    - Java Protobuf serialization
  date: 2026-06-30
---

# ProtoBuf 缓存污染：一次跨越 7 层调用链的故障排查

> 上午 10 点，测试群里炸了——"录音页面 500 了！"但我自己打开完全正常。更诡异的是：管理员账号报错，普通账号正常。同一个接口、同一套代码，不同人看到的结果完全不同。

## 故障现象

```json
{"code": 500, "msg": "Reading from a byte array threw an IOException (should never happen)."}
```

注意最后的括号——"(should never happen)"。这是 ProtoStuff 源码中的注释原文被原样包装成了异常消息。写这段代码的开发者认为这个 IOException 永远不会发生。

它确实发生了。

## 缩小范围：为什么不同账号不同命运？

第一个突破口：报错的都是管理员，非管理员账号完全正常。但管理员和普通用户调用的是同一个 Controller 方法：

```java
@GetMapping("/page")
public R<IPage<DeviceVocRecordCombineVO>> page(DeviceVocRecordCombineVO vo, Query query) {
    return R.data(service.selectDeviceVocRecordCombinePage(vo, query));
}
```

区别一定在 Service 层的某个地方。看 Service 实现：

```java
@Override
public IPage<DeviceVocRecordCombineVO> selectDeviceVocRecordCombinePage(...) {
    // ...
    DeptAuthUtil.preAuth(params); // ← 这里！第 36 行
    // ...
}
```

`DeptAuthUtil.preAuth()` 会从缓存取当前用户的部门信息做数据权限过滤。管理员和非管理员的 `dept_id` 不同——管理员的 `dept_id` 是系统根部门 `1123598813738675201`。

## 七层调用链追踪

沿着栈帧一层层往下追：

```
Layer 1: Controller
  DeviceVocRecordCombineController.page()
    ↓
Layer 2: Service
  DeviceVocRecordCombineServiceImpl.selectDeviceVocRecordCombinePage()
    ↓
Layer 3: Auth Util
  DeptAuthUtil.preAuth(params)              // 第 36 行
    ↓
Layer 4: Cache API
  SysCache.getDept(deptId)                  // deptId = 1123598813738675201
    ↓
Layer 5: Cache Util
  CacheUtil.get(SYS_CACHE, DEPT_ID, id, ...)
    ↓
Layer 6: Redis Cache
  RedisCache.lookup()                       // 从 Redis 读字节数组
    ↓
Layer 7: Serializer
  ProtoStuffSerializer.deserialize()        // 字节数组 → Dept 对象
    ↓ 💥
  ProtobufIOUtil.mergeFrom()
    → ProtobufException: invalid tag (zero)
```

## 根因：ProtoBuf schema 漂移

问题出在第 7 层的序列化与反序列化之间。

`Dept` 实体类在某个时刻发生过字段变更（增加字段、删除字段、变更类型等）。变更前的代码将 Dept 对象用 ProtoStuff 序列化后写入 Redis。变更后的代码尝试用**新的 ProtoBuf schema** 去反序列化旧数据。

ProtoBuf 是 schema-based 的序列化协议。每个字段有一个 wire type tag。当解码器遇到一个它不认识的 tag（特别是 tag=0，表示无效字段）时，会抛出 `ProtobufException`。

**为什么普通用户不会触发？** 因为他们的 `dept_id` 是业务部门 ID，系统上线后才创建，类变更后写入 Redis，用的是新版 schema。

**为什么管理员会触发？** 管理员的 `dept_id = 1123598813738675201` 是根部门，系统初始化时就创建并缓存了。类变更后从未被驱逐重写，一直保持着旧版本的序列化数据。

简单说：**Redis 里存着一个旧版本的 Dept 对象，ProtoBuf 不认识它了。**

## 修复：一行命令 vs 一劳永逸

### 临时修复（30 秒解决）

```bash
redis-cli KEYS "*dept*" | xargs redis-cli DEL
```

清掉所有部门缓存后，系统从 MySQL 重新加载 → 用当前版本 ProtoStuff 序列化写入 Redis → 问题消失。

### 永久方案三选一

**方案 A：部署时自动清缓存**（当前采用）
```bash
# 在部署脚本中加一行
redis-cli KEYS "*dept*" | xargs redis-cli DEL
```
简单粗暴，但治标不治本。类变更不被追踪，纯依赖运维记忆。

**方案 B：缓存 key 加版本号**
```java
// 从 dept:id:1123598813738675201 → dept:id:v2:1123598813738675201
public String getCacheKey(Long id) {
    return "dept:id:v" + Dept.SERIAL_VERSION + ":" + id;
}
```
类变更时递增版本号，旧缓存自动失效。需要团队约定在每次 Dept 字段变更时手动递增。

**方案 C：换序列化方案**
把 ProtoStuff 换成 Jackson JSON。牺牲一点性能（序列化后体积大约增加 30%，速度慢约 2-3 倍），但换来的是：
- 字段增删不会导致反序列化失败（多余字段被忽略，缺失字段为 null）
- 缓存内容人类可读（`redis-cli get` 看到的是 JSON）
- 不需要改实体类时记得递增版本号

**推荐**：对于内部管理系统（非高并发场景），方案 C 最省心。如果性能敏感，方案 B 是折中。

## 教训

1. **序列化方案的选择是架构决策**：ProtoBuf 的高性能是有代价的——对 schema 变更加敏感。团队是否有人负责维护 schema 兼容性？如果没有，不要用。

2. **"should never happen" 的异常真的会发生**：ProtoStuff 源码中那个注释的作者也认为 IOException 不可能。但 schema 漂移 + 缓存持久化这种组合场景，单测覆盖不到。

3. **不同账号不同表现 ≠ 权限问题**：一开始大家都以为是权限配置的 Bug。但根因是缓存中的数据版本不一致——排查的思维盲区。

4. **缓存 key 要可追踪**：如果 key 里包含序列化版本号，故障一目了然——"v1 的 key 在 v2 的代码里反序列化"。

## 受影响范围

所有走 `DeptAuthUtil.preAuth()` 的接口都会触发——不仅是录音页面，还包括设备管理、质检结果等十几处。只是因为录音页面访问最频繁，所以最先被报告。

## 关联

- [[stats-dashboard]] — 统计大屏，其 Tab3 溯源按钮修复与本次故障在同一天排查
- [[bladex-platform]] — BladeX 架构中的 Redis 配置和缓存体系
