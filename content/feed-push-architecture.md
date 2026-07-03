---
name: "Feed 流推送架构：从关注取关到千万粉丝消息推送"
description: "详解社交平台的关注/粉丝/Feed 流推送架构设计：Redis Set 双向关注关系、ZSet Feed 收件箱、推拉模式选择、大 V 粉丝异步推送优化。含 Kafka 消息队列在生产环境的核心用法。"
metadata:
  type: article
  featured: true
  highlight: "Redis Set关注关系、ZSet收件箱、推拉模式选型、Kafka异步百万粉丝推送"
  tech:
    - Redis
    - Kafka
    - Spring Boot
    - ZSet
  date: 2026-07-03
  readingTime: "12 min"
---

# Feed 流推送架构：从关注取关到千万粉丝消息推送

## 业务场景

在"优选生活"平台中实现了类似小红书/抖音的**关注推送**功能。用户可以关注/取关其他用户、查看关注列表和粉丝列表、查看共同关注、关注的人发布探店点评后粉丝在首页看到推送。

高并发难点：**大 V 一发点评，百万粉丝需要推送**，不能同步阻塞。

## 存储结构：全部用 Redis

### 1. 关注列表（我关注了谁）

```
Key:  follow:{userId}:follow
Type: Set
操作: SADD / SREM / SMEMBERS
```

### 2. 粉丝列表（谁关注了我）

```
Key:  follow:{userId}:fans
Type: Set
操作: SADD / SREM / SMEMBERS
```

### 3. 共同关注（面试亮点）

求两个用户关注列表的**交集**：

```bash
SINTER user1:follow user2:follow
```

一行命令，毫秒级得出共同关注。

## 关注 / 取关逻辑

```
点击关注：
  SADD follow:myId:follow 对方ID
  SADD follow:对方ID:fans 我的ID

点击取关：
  SREM follow:myId:follow 对方ID
  SREM follow:对方ID:fans 我的ID
```

**用 Lua 脚本保证两个操作原子执行**，避免一边加了一边没加导致数据不一致。

```lua
-- 关注 Lua 脚本
local myId = KEYS[1]
local targetId = KEYS[2]

redis.call('SADD', 'follow:' .. myId .. ':follow', targetId)
redis.call('SADD', 'follow:' .. targetId .. ':fans', myId)
return 1
```

## Feed 流推送：推模式 vs 拉模式

### 推模式（我们项目使用）

当用户发一条探店点评时：

1. 从粉丝列表（Redis Set）取出所有粉丝 ID
2. **异步**给每个粉丝的**收件箱**插入这条笔记 ID
3. 粉丝打开 APP 直接读自己的收件箱

收件箱结构：

```
Key:   feed:{userId}:inbox
Type:  ZSet（score = 时间戳，value = 点评ID）
```

优点：
- 查询极快，`ZREVRANGE feed:1001:inbox 0 9` 直接取最新 10 条
- 首页不查数据库，高并发抗压

### 拉模式

用户打开首页时，主动去查询所有关注人的最新动态。

缺点：关注人多时，查询量巨大，首页响应慢。

### 混合模式

我们的优化策略：
- 普通用户（粉丝 < 1 万）→ **推模式**，实时性好
- 大 V（粉丝 > 1 万）→ **拉模式**，减少推送成本
- 活跃粉丝用推模式，非活跃用拉模式

## 为什么用异步推送？

如果一个大 V 有 **100 万粉丝**，同步推送会：

- 接口超时（遍历 100 万条 Redis 操作）
- Redis 瞬时压力巨大
- 用户体验极差（发布者要等推送完成）

解决方案：**线程池 + Redis Stream / Kafka 消息队列**

后台异步消费，不阻塞发布接口。发布者点发送后立刻返回成功，系统后台慢慢推送给所有粉丝。

## Kafka 核心知识点

项目中 Kafka 用于异步消息处理。以下是生产环境的核心要点：

### Kafka 为什么快？

- **顺序写磁盘**：消息追加写入文件末尾，避免随机寻道
- **零拷贝**：数据从内核 Page Cache 直接到网卡，不经过用户态
- **页缓存**：利用 OS 内核内存缓存，而非 JVM 堆内存
- **批量发送与压缩**：Producer 打包发送，支持 GZIP/Snappy 压缩
- **分区并行**：通过 Partition 实现水平扩展

### 如何保证消息不丢失？

| 端 | 措施 |
|------|------|
| **Producer** | `acks=all`，确保 Leader + 所有 ISR 副本都收到 |
| **Consumer** | 关闭自动提交 Offset，业务处理成功后再手动提交 |
| **Broker** | `min.insync.replicas > 1`，至少 2 个副本同步成功 |

### 如何保证消息不重复消费（幂等性）？

Kafka 只能保证至少投递一次（At-Least-Once）。消费者端需实现幂等：

- 数据库唯一索引（如订单 ID）
- Redis `SETNX` 记录已处理的消息 ID
- 先查询状态再更新

### 如何保证消息顺序性？

Kafka 只保证**单个 Partition 内**有序：

- 发送端：将需要顺序的消息（如同一订单操作）指定相同 Key，Hash 到同一 Partition
- 消费端：单线程消费该 Partition

## 面试高频追问

**1. 关注、粉丝为什么放 Redis？**
查询量巨大，数据库扛不住。Set 结构天然适合关注关系，共同关注求交集极快，性能比 MySQL 高几十倍。

**2. 大 V 发点评如何推送给粉丝？**
异步遍历粉丝列表，使用 ZSet 插入粉丝 Feed 收件箱。超过一定粉丝数改用拉模式。

**3. 如何保证关注与粉丝数据一致？**
Lua 脚本保证关注和粉丝双向操作原子性。

## 经验总结

- **Set 天然适合社交关系**——关注、粉丝、共同关注，SQL 做不到一行命令出结果
- **ZSet 是 Feed 流的最佳数据结构**——时间戳作为 score，天然按时间倒序
- **推模式适合普通用户，拉模式适合大 V**——没有银弹，混合模式最优
- **异步是底气**——面对百万粉丝的推送，消息队列不是可选项，是必选项
