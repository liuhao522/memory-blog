---
title: "voc-mini 小程序：案例学习对齐 saber3 + 全站滚动交互优化"
date: "2026-07-24"
category: "Projects"
tags: ["uni-app", "微信小程序", "BladeX", "案例学习", "uview-pro", "滚动隐藏"]
description: "对齐 saber3 案例管理模块的调听接口，修复角色名硬编码，全站搜索栏滚动隐藏，以及踩过的那些 uni-app 小程序坑。"
---

## 背景

voc-mini 是智慧工牌系统的微信小程序端，基于 uni-app (Vue3) + uview-pro 构建。最近的一个核心任务是让"案例学习"模块对齐 Web 端 saber3 的案例管理（`/device/caseDetail`），实现"立即学习 → 调听录音"的完整闭环。

## 案例学习：从 Mock 到真实 API

### 问题一：数据源不对

案例列表原本调用的是 `getTopCases` API（blade-record 服务），但这个接口的测试环境版本太旧，**不返回 `vocRecordId`**——没有录音 ID，就无法跳转调听。

切到 saber3 同款的 `caseDetail/list`（blade-device 服务）：

```js
// 旧：getTopCases — blade-record，测试环境未部署新版，无 vocRecordId
// 新：getCaseDetailList — blade-device，已部署，有 vocId + caseDetail.id
const res = await Apis.getCaseDetailList({ status: 2, current: 1, size: 100 })
const data = res?.data?.data || res?.data || {}
const list = data.records || []
```

字段映射变化：

| 旧字段 (TopCaseVO) | 新字段 (CaseDetailVO) | 用途 |
|---|---|---|
| caseName | storageName | 标题 |
| recommendReason | reason | 推荐原因 |
| learnTimes | learnTimes | 学习次数 |
| ❌ 无 | vocId | 录音ID，跳转调听 |
| ❌ 无 | id | caseDetail主键，调learn API |

### 问题二：learn API 调用

saber3 的案例学习页（`caseLearn.vue`）"学习"按钮做了两件事：

```js
handlePre(row) {
    learn(row)                           // ① POST /caseDetail/learn
    this.$router.push({                  // ② 跳转 analysisDetail
        path: `/quality/analysisDetail`,
        query: { id: row.vocId }
    });
}
```

小程序端对齐后：

```js
const handleLearn = async () => {
  // ① 调 learn API（caseDetail/list 已返回主键 id，无需额外查询）
  await Apis.caseDetailLearn({ id: caseDetailId })
  // ② 更新本地已学状态
  const learned = uni.getStorageSync('learned_case_ids') || []
  if (!learned.includes(key)) {
    learned.push(key)
    uni.setStorageSync('learned_case_ids', learned)
  }
  // ③ 跳转录音详情
  uni.navigateTo({ url: `/pages/recordings/detail?id=${vocId}` })
}
```

### 问题三：u-button 小程序不触发 @tap

这是踩的最隐蔽的坑。在 H5 调试时一切正常，但在真机/模拟器小程序里点击按钮完全没反应。

**根因**：uview-pro 的 `u-button` 组件在小程序环境下不转发 `@tap` 事件。

**修复**：换成原生 `<button>`：

```html
<!-- 旧：不触发 -->
<u-button type="success" size="small" @tap="handleLearn">立即学习</u-button>

<!-- 新：正常工作 -->
<button class="learn-btn" @tap="handleLearn">立即学习</button>
```

## 角色名：打破硬编码

"我的端"页面一直显示"销售服务顾问"，但其实后端 API 返回了真实的角色名。

**根因**：`GET /blade-system/user/info` 返回的 `UserVO` 中，角色字段是 **`roleName`**（逗号分隔的字符串，来自 `blade_role` 表），不是 `roles`（数组）。

```js
// 旧代码 — 永远走到 fallback
const roles = info.roles || []   // ← undefined!
if (roles.length > 0) { ... }
// fallback: '销售服务顾问'  // ← 硬编码

// 修复：直接读 roleName 字符串
const roleStr = info.roleName || ''  // "超级管理员,用户"
if (roleStr) return roleStr
```

## 全站固定搜索栏：下滑隐藏、上滑显示

参考录音库页面的实现，给所有固定搜索栏加上了滚动隐藏效果。

### 通用方案

```js
// 页面级 onPageScroll
const headerVisible = ref(true)
let lastScrollTop = 0

onPageScroll((e) => {
  const st = e.scrollTop
  if (st <= 10) headerVisible.value = true
  else if (st > lastScrollTop + 5) headerVisible.value = false
  else if (st < lastScrollTop - 5) headerVisible.value = true
  lastScrollTop = st
})
```

```css
.sticky-header {
  position: fixed; left: 0; right: 0; top: 0; z-index: 100;
  transition: transform 0.25s ease;
}
.header-show { transform: translateY(0); }
.header-hide { transform: translateY(-100%); }
```

### 智研图表的动态间距

智研图表页有 4 个子 Tab，其中"服务质量"和"人员效能"多了质检模型选择栏，header 高度更大。用 `computed` 动态适配：

```js
const headerPadding = computed(() => {
  return (activeSubTab.value === 'quality' || activeSubTab.value === 'performance')
    ? '450rpx' : '340rpx'
})
```

避免"服务效率/客户洞察"顶部有大片空白，也避免"服务质量/人员效能"内容被遮挡。

### 案例学习分类栏的特殊处理

`case-study.vue` 是子组件，`onPageScroll` 只能在页面级使用。通过父页面 `cases.vue` 传递 `headerVisible` prop：

```
cases.vue (页面) → onPageScroll → headerVisible prop → case-study.vue (组件)
```

### 涉及页面

| 页面 | 状态 |
|------|------|
| 录音库 | 已有（参考实现） |
| 智研图表 | 已加 + 动态间距 |
| 客户管理 | 已有 |
| 案例学习 | 已加（父子配合） |

## 其他修复

### 头像

去掉了 Unsplash 默认头像，数据库没有头像时什么都不显示，也不渲染空圈：

```html
<image v-if="getAvatar" :src="getAvatar" class="user-avatar" />
```

### 更换绑锁

`getUserDevice` API 在用户没有设备时返回 `{ deviceId: -1, deviceNo: "" }` 的兜底记录而非空数组，导致无设备用户也显示"当前配挂"。加了过滤：

```js
list.push(...arr.filter(d => d.deviceId !== -1 && d.deviceNo))
```

### 无设备工作台

`EmployeeDashboard` 设备卡片加了 `v-if="hasDevice"`，无工牌用户不再展示虚构的设备状态卡。

## 总结

这次改动核心是"对齐"——让小程序端的案例学习与 saber3 Web 端使用相同的 API 和交互逻辑。过程中踩了 uni-app 跨端兼容的坑（`u-button` @tap、`onPageScroll` 组件限制、`onShow` 刷新状态），也顺手修复了几个历史遗留的硬编码问题。
