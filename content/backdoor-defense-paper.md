---
name: backdoor-defense-paper
description: 后门防御深度哈希论文 —— Neurocomputing 投稿全过程追踪
metadata:
  type: project
---

## 论文基本信息

- **标题**：Defending Backdoor Attacked Images with Deep Hashing
- **作者**：Yunchun Zhang, Hao Liu, Feiyang Huang, Mingxiong Zhao（通讯，jimmyzmx@gmail.com）
- **单位**：云南大学国家示范性软件学院
- **方向**：后门攻击防御 × 深度哈希 × AI 安全
- **核心方法**：EfficientNetV2 特征提取 → CSQ 中心相似量化 → GMM 自适应阈值（汉明距离双峰分布）
- **实验**：4 数据集（MNIST/CIFAR-10/GTSRB/ImageNet100）× 6 攻击（BadNets/Blended/SIG/WaNet/Refool/Input-aware）× 多基线
- **核心指标**：CIFAR-10 F1 >98%，ImageNet100 F1 >92%

## 投稿状态

- **目标期刊**：Neurocomputing（Elsevier，ISSN 0925-2312，CCF-C，IF ~5.5-6.5，中科院2区）
- **当前阶段**：格式转换完成，待上传 Overleaf 编译验证
- **Deadline**：2027年5月毕业，需 2027年3月前拿到录用通知
- **投稿计划**：2026年7月底前投出，一审预计 2026年10-12月返回

## 文件位置

- **原始 IEEEtran 论文**：`D:\lh\Downloads\main.tex`（822行）
- **原始 bib 文件**：`D:\lh\Downloads\Reference.bib`
- **转换后 elsarticle 论文**：`D:\lh\Downloads\main-elsarticle.tex`（738行，89KB）
- **Elsevier 模板目录**：`D:\lh\Downloads\Elsevier_Article__elsarticle__Template`
- **参照论文 BDV**：`D:\lh\Desktop\1-s2.0-S092523122502805X-main.pdf`
- **参照论文 NeuroPatch**：`D:\lh\Desktop\1-s2.0-S0925231226006806-main.pdf`
- **Overleaf 项目**：已导入 elsarticle 模板

## 已完成工作

1. ✅ IEEEtran → elsarticle 格式转换
2. ✅ 所有 IEEE 特有命令清除（IEEEtran/IEEEauthorblockN/maketitle 等）
3. ✅ figure*/table* → figure/table 全部转换
4. ✅ 作者列表空行修正
5. ✅ 注释掉的旧段落全部删除
6. ✅ 新增 Limitations and Future Work 段（Conclusion 之后）
7. ✅ 新增 3 篇 Neurocomputing 引用（BDV/BN Correction/NeuroPatch），已加入正文和 bib
8. ✅ 环境配对检查全部通过（15种环境，begin/end 完美匹配）
9. ✅ Reference.bib 已更新

## 待完成

1. ⬜ 上传 main-elsarticle.tex + Reference.bib + imgPDF/ 到 Overleaf
2. ⬜ Overleaf 编译验证，修报错
3. ⬜ 英文润色（Grammarly/ChatGPT）
4. ⬜ 撰写 Cover Letter
5. ⬜ Elsevier Declaration Tool 生成利益冲突声明
6. ⬜ 准备推荐审稿人列表（3-5人）
7. ⬜ Editorial Manager 系统提交（https://www.editorialmanager.com/neucom）
8. ⬜ 代码上传 GitHub（可选但加分）

## 格式关键参数

- **文档类**：`\documentclass[review,12pt]{elsarticle}`（review=双倍行距+行号）
- **引用样式**：`elsarticle-num`（数字编号 `[1]` `[2]`）
- **投稿时**：单栏 + 双倍行距 + 行号（约50页）
- **出版时**：双栏紧凑（约10-12页），Elsevier 排版
- **页数限制**：无硬性限制，50页 review 模式正常

## 与竞品论文的关键差异

参见对比分析：
- vs BDV：BDV 主动注入后门（"以毒攻毒"），我们不修改训练数据更安全
- vs NeuroPatch：NeuroPatch 针对扩散模型（生成），我们针对分类器更普适
- 核心优势：实验最扎实（4×6×10+），首次将深度哈希用于后门防御

## Overleaf 项目清理

需保留的文件：
- `elsarticle-template-num.tex`（主文件，名改为 main.tex）
- `elsarticle.cls`（文档类）
- `elsarticle-num.bst`（引用样式）
- `Reference.bib`（参考文献）
- `imgPDF/`（图片文件夹）

需删除的文件：
- `elsarticle-template-harv.tex`、`elsarticle-template-num-names.tex`
- `elsarticle-harv.bst`、`elsarticle-num-names.bst`
- `cas-refs.bib`、`grabs.pdf`
