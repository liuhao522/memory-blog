---
name: voiceprint-system
description: 声纹识别系统知识图谱 — 注册姓名查询逻辑、跳过未注册优化
metadata: 
  node_type: memory
  type: project
  tech: 
    - Java 17
    - Spring Boot 3.2
    - MyBatis-Plus
    - BladeX 4.6.0
  date: 2026-06-29
  originSessionId: 9f146a9e-ef34-40ba-b7de-dedc6a30735c
---

# 声纹识别系统知识图谱

---

## 声纹注册页面姓名查询逻辑

### 调用链路
```
device/voiceprintLibrary.vue:387 remoteSearchUser()
  → @/api/system/user.js getList()
    → GET /blade-system/user/page
      → UserController.java:132 page()
        → UserServiceImpl.java:188 selectUserPage()
          → UserMapper.xml:30 selectUserPage → blade_user 表
```

### 结论: 租户隔离正确
- Controller 层: 非管理员用户自动带上 `bladeUser.getTenantId()` 过滤
- MyBatis XML: `and tenant_id = #{tenantId}` 条件正确应用
- 前端不传 tenantId，不会被恶意覆盖

### 发现的问题: name 参数无效
前端 `device/voiceprintLibrary.vue:389-391`:
```js
params.name = keyword;       // ← SQL 中无对应过滤，被静默丢弃
params.realName = keyword;   // ← 实际生效
```

MyBatis XML (`UserMapper.xml`) 中只检查了 `user.realName`，没有 `user.name`:
```xml
<if test="user.realName!=null and user.realName != ''">
    and real_name = #{user.realName}
</if>
```

### 建议修复
删除无效的 `params.name = keyword` 行，只保留 `params.realName`。修复无功能影响，仅消除代码误导性。

### 相关端点对比
| 端点 | 用途 | 租户过滤方式 |
|------|------|-------------|
| `/blade-system/user/page` | 声纹注册姓名搜索 | 比较 tenant_id == "000000" |
| `/blade-system/user/user-list` | 设备绑定员工选择 | AuthUtil.isAdministrator() |

---

## 声纹匹配跳过未注册员工优化

**文件**: `DeviceVocRecordCombineServiceImpl.java` | **分支**: master
**部署**: 2026-06-12, 服务器 `/data/docker/voc_quality/blade/device/app.jar`

### 已完成的修改

在三处声纹匹配入口增加了前置检查，未注册声纹的员工直接跳过，避免浪费 API 调用：

1. `asr(DeviceVocRecordCombineEntity, Date)` — 线程内查声纹库，未注册则 return
2. `asr(Long id)` — 同上
3. `autoIdentifyOwnerSpeakers()` — 同上（定时任务 @Scheduled 每分钟）

**检查逻辑**:
```java
boolean hasVoiceprint = ownerName != null && !ownerName.isEmpty()
    && voiceprintLibraryService.count(Wrappers.<VoiceprintLibraryEntity>lambdaQuery()
        .eq(VoiceprintLibraryEntity::getUserName, ownerName)) > 0;
if (!hasVoiceprint) { return; }
```

### 待优化事项

**问题1: 未注册记录被重复捡起**
`autoIdentifyOwnerSpeakers()` 查询条件 `isNull(owner_speaker_id)` + `LIMIT 1`，跳过时未标记。导致每分钟重复查询同一条未注册员工的记录（虽然只是一次 COUNT，但无效轮询）。

**问题2: 员工后来注册了声纹怎么办**
如果设 `owner_speaker_id = -1` 来避免重复捡起，需要配套机制：注册成功后把该员工 `-1` 记录改回 `NULL`。

### 设计方案（下次实现）
1. `autoIdentifyOwnerSpeakers()` — 跳过时设 `owner_speaker_id = -1`（与 ASR 无句子信息时处理一致）
2. `VoiceprintLibraryController.register()` — 注册成功后，把该员工 `owner_speaker_id = -1` 的记录重置为 `NULL`

---

## 关联记忆
[[bladex-platform]] [[stats-dashboard]] [[checkin-system]]
