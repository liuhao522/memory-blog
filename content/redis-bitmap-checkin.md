---
name: "Redis BitMap 实现千万用户每日签到"
description: "用 Redis BitMap 实现签到功能的完整方案：为什么不用 MySQL？如何防止重复签到？连续签到天数怎么算？100 万用户 1 个月仅需几 MB 内存，SETBIT + BITCOUNT 一行命令搞定。"
metadata:
  type: article
  featured: true
  highlight: "BitMap极省内存百万用户几MB，SETBIT防重复签到，BITCOUNT统计"
  tech:
    - Redis
    - BitMap
    - Spring Boot
    - Java
  date: 2026-07-03
  readingTime: "8 min"
---

# Redis BitMap 实现千万用户每日签到

## 业务场景

在"优选生活"平台中，我们做了**用户每日签到**功能用来提升活跃度。规则是：用户每天签到 1 次可获得积分/优惠券，连续签到天数越多奖励越丰厚，每月数据独立（次月清零）。

核心技术选型：**Redis BitMap**，极省内存、超高性能。

## 为什么用 Redis BitMap？

签到只需要存 **0（未签）/ 1（已签）** 两个状态。如果用 MySQL：

- 每用户每天一行记录 → 100 万用户 1 个月 = 3000 万行
- 查询慢、写入慢、存储浪费

用 Redis BitMap：
- 100 万用户 1 个月仅需 **几 MB**
- BitMap 底层是 String 结构，用二进制位存储，1 个用户 1 个月仅占 4 字节
- 性能极高，`SETBIT`/`GETBIT` 都是 O(1)

## Redis Key 设计

```
签到记录：sign:{userId}:{yearMonth}
例：sign:1001:202507

连续签到天数：user:sign:count:1001
```

Key 里带年月，比如 `202507`，8 月自动用新 key `202508`，天然实现每月清零，不需要手动清理。

## 签到核心流程

1. 用户点击签到
2. 使用 `SETBIT sign:1001:202507 5 1` 把对应位设为 1
   - `SETBIT` 返回**旧值**：
     - 返回 **0** → 今天第一次签到 ✅
     - 返回 **1** → 今天已签过，拒绝 ❌
3. 签到成功后，统计**连续签到天数**
4. 发放对应奖励
5. 返回前端签到结果

**`SETBIT` 返回旧值这个特性完美解决了防重复签到问题**，不需要额外加锁。

## 连续签到怎么算？

从**今天往前倒着查**，直到遇到某一天未签到，停止。统计一共多少个连续的 1。

```java
public int getContinuousSignDays(Long userId, int dayOfMonth) {
    String key = "sign:" + userId + ":" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
    int count = 0;
    // 从今天往前查，遇到 0 就停止
    for (int i = dayOfMonth; i >= 1; i--) {
        Boolean signed = redisTemplate.opsForValue()
            .getBit(key, i - 1);  // BitMap 从 0 开始
        if (Boolean.TRUE.equals(signed)) {
            count++;
        } else {
            break;
        }
    }
    return count;
}
```

Redis 命令：
```bash
# 签到（6月5日）
SETBIT sign:1001:202506 4 1

# 查今天是否签到
GETBIT sign:1001:202506 4

# 统计本月签到了几天
BITCOUNT sign:1001:202506
```

## 常用功能实现

| 功能 | Redis 命令 | 说明 |
|------|-----------|------|
| 签到 | `SETBIT key offset 1` | 返回旧值判断是否重复 |
| 查询某天 | `GETBIT key offset` | 0 或 1 |
| 本月签到天数 | `BITCOUNT key` | 直接统计所有 1 |
| 哪几天签到了 | 遍历位，找所有 1 的下标 | 对应日期 |
| 每月自动清零 | key 里带年月 | `202507` → `202508` 天然清零 |

## 面试高频追问

**1. 为什么用 Redis 不用 MySQL？**

MySQL 存签到太浪费空间，高并发场景扛不住。Redis BitMap 天生适合 0/1 状态记录，性能高、省内存。

**2. 如何防止重复签到？**

`SETBIT` 返回旧值：0 → 可以签，1 → 已签过。一行命令搞定，不需要分布式锁。

**3. BitMap 底层是什么？**

底层是 Redis String 结构，以二进制位存储。1 个用户 1 个月仅占 4 字节。Redis String 最大 512MB，理论上可存储 2^32 个位——足够覆盖全球人口的签到需求。

## 经验总结

- **BitMap 是 Redis 最被低估的数据结构**——签到、在线状态、用户标签都适用
- **Key 设计决定了代码复杂度**——年月天然分割比手动清理简单得多
- **`SETBIT` 返回旧值这个特性非常巧妙**——一个命令同时完成检查和写入
