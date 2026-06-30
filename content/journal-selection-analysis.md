---
name: journal-selection-analysis
description: 后门防御深度哈希论文的目标期刊筛选——PR/ESWA/KBS/Neurocomputing 四选一
metadata: 
  node_type: memory
  type: project
  originSessionId: df54916b-1411-4f13-9f06-856085db0e22
---

## 论文信息
- **标题**：Defending Backdoor Attacked Images with Deep Hashing
- **方法**：EfficientNetV2 特征提取 → CSQ 中心相似量化 → GMM 自适应阈值（汉明距离双峰分布）
- **实验**：4 数据集（MNIST/CIFAR-10/GTSRB/ImageNet100）× 6 攻击（BadNets/Blended/SIG/WaNet/Refool/Input-aware）× 多基线
- **核心指标**：CIFAR-10 F1 >98%，ImageNet100 F1 >92%
- **创新定位**：组合创新（首个将深度哈希用于后门防御）
- **对标竞品**：BDV（Neurocomputing 2025）
- **投稿时间线**：2026年7月底前投出，2027年3月前需录用通知（毕业 deadline）

## 最终选择：Pattern Recognition（首选）→ Neurocomputing（兜底）

## 投稿策略
```
7月底 投 Pattern Recognition
  ├─ desk reject → 立即转 Neurocomputing（同 Elsevier 系统，格式通用）
  ├─ 送审后 4-7 个月出结果 → 12月-1月录用 ✅
  └─ ⚠️ 审稿速度方差大（3-15月），需关注进度
```

## Pattern Recognition 核心数据（2025）
- CCF-B，中科院 1区 TOP，IF 7.6→9.1
- 国人占比 ~85%，年发文 ~1,297（扩刊中）
- 后门防御 6+ 篇先例 + 深度哈希 4+ 篇先例 → **方向完美匹配**
- Desk reject 主因：实验设计缺陷 65% → 你的实验量恰是强项
- 录用率 ~18-20%，审稿 4-7 月（快 3 月 / 慢 15 月+）
- 版面费 0（订阅模式），需代码开源（GitHub）
- 真实评论：声誉极高但审稿速度方差大，审稿人跑路现象存在

## Neurocomputing 兜底数据
- CCF-C，中科院 2区（2025 丢 TOP 标签），IF 6.5
- 投稿量 ~18,000（最小竞争池），发文 ~2,364
- Desk reject ~40%（主卡格式/方向），录用率 ~18-22%
- 竞品 BDV 发在此刊 → 方向确认

## 已排除的期刊及原因
- **ESWA**：72% desk reject（官方），36,000+ 投稿争 4,000 坑，组合创新难过初审
- **KBS**：需 knowledge-driven 基因，论文是 data-driven → 方向不匹配
- EAAI：审稿 7 月+，时间紧
- Neural Networks：审稿历史平均 10 月
- Information Sciences：OA 费 $3,090 + IF 曾被镇压
- IEEE Access：不在 CCF 目录
- Applied Intelligence / PRL / CVIU / IVC：CAS 3 区（导师不批）

## 格式兼容性
四本都是 Elsevier，elsarticle 模板通用。改投只需换 Cover Letter，无需重新排版。

## 待办
- ⬜ 论文代码上传 GitHub（PR 硬性要求）
- ⬜ PR Cover Letter 重点：强调首次将深度哈希用于后门防御 + 实验覆盖度
- ⬜ Neurocomputing 备份版 Cover Letter 准备
- ⬜ 投稿后 With Editor > 2 周即催稿
- ⬜ 投稿 2 月无审稿进展 → 撤稿转 Neurocomputing

## 相关记忆
- [[backdoor-defense-paper]] — 论文详细状态
