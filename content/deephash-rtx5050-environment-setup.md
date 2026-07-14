---
name: deephash-experiment-environment-setup
description: 深度哈希后门防御实验环境 — 从服务器迁移到本地 RTX 5050 笔记本电脑全过程
metadata:
  type: project
---

## 背景

深度哈希后门防御论文的实验代码原本运行在实验室服务器（Xeon + A100），毕业前需要迁移到本地笔记本（ROG FA608UH，Ryzen7 + RTX 5050 8GB）继续跑实验。这是一次"从服务器到本地、从 Linux 到 Windows"的完整迁移。

## 硬件与系统

- **机型**：ROG FA608UH 笔记本
- **CPU**：AMD Ryzen 7，15.3GB 内存
- **GPU**：NVIDIA GeForce RTX 5050 Laptop GPU（8GB VRAM）
- **架构**：Blackwell（sm_120），CUDA 12.8 驱动
- **系统**：Windows 11 Home China
- **代码库**：40GB（含 MNIST/CIFAR-10/GTSRB/ImageNet 数据集），575 个 Python 文件

## 环境搭建

### 1. Python 与 Conda

使用 Miniconda 创建 `deephash` 环境，Python 3.10。原代码基于 Python 3.9 + PyTorch 1.12.1，新环境升级到 Python 3.10 + PyTorch 2.7.0。

### 2. PyTorch GPU 版 — 最大的坑

RTX 5050 是 Blackwell 架构（sm_120），PyTorch 2.6 及更早版本的 CUDA 预编译包只支持到 sm_90。安装 cu124 版本后虽然 `torch.cuda.is_available()` 返回 `True`，但实际运算会报错：

```
NVIDIA GeForce RTX 5050 Laptop GPU with CUDA capability sm_120
is not compatible with the current PyTorch installation.
RuntimeError: CUDA error: no kernel image is available for execution on the device
```

**解决**：需要 PyTorch 2.7.0+cu128（第一个支持 Blackwell sm_120 的稳定版本）。

```
pip install torch==2.7.0 torchvision==0.22.0 torchaudio==2.7.0 --index-url https://download.pytorch.org/whl/cu128
```

但校园网到 `download.pytorch.org` 丢包严重，torch wheel 有 3.2GB，pip 下载极慢。最终用**迅雷**下载三个 wheel 文件到本地再安装解决。

### 3. 依赖包清单

环境完整的依赖（实验必需）：

| 包 | 用途 |
|------|------|
| torch 2.7.0+cu128 | GPU 训练 |
| torchvision 0.22.0 | 图像加载 |
| pandas | Excel 数据管线 |
| scipy | 科学计算 |
| scikit-learn | GMM 高斯混合模型 |
| opencv-python | 图像处理 |
| matplotlib | 可视化 |
| efficientnet-pytorch | EfficientNetV2 预训练权重 |
| openpyxl / xlrd / xlwt | Excel 读写 |
| tensorboard | 训练日志 |
| tqdm | 进度条 |

## 代码迁移修复

从服务器迁移到本地 Windows，需要修大量硬编码配置：

### 路径修复（103 个文件）

服务器的 Linux 路径 `/rjxy/t0b/teacher04/lh/deephash_original/` 全部替换为 `D:/deephash_original/`，还有旧笔记本的 `C:\Users\90478\Desktop\` 和 `E:\` 盘路径也一并修复。

### GPU 索引修复（~30 个文件）

服务器有 4-5 张 GPU，脚本里硬编码了 `cuda:1`、`cuda:2`、`cuda:3`、`cuda:4`。笔记本只有一张 RTX 5050，全部改为 `cuda:0`。

### train.txt 路径 Bug（1 行）

`utils/tools.py` 第 73 行少了一个 `/`：

```python
# 原始（Bug）
"train_set": {"list_path": "./data/" + config["dataset"] + "train.txt", ...}

# 修复后
"train_set": {"list_path": "./data/" + config["dataset"] + "/train.txt", ...}
```

导致所有数据集的 train.txt 路径拼成 `./data/GTSRBtrain.txt` 而不是 `./data/GTSRB/train.txt`。

### batch_size 优化（~90 个文件）

原配置 batch_size=64 或 128，RTX 5050 8GB 显存顶不住（报 CUDA out of memory）。全局改为 16。

### epoch 调整（85 个文件）

原配置 150 epochs，每轮约 40 秒，跑完一个实验要 100 分钟。为快速验证，全部改为 50 epochs。

### Linux 路径修复

`gradcam.py` 中的 `/home/ycz_wa/xcy/repository/...`、`train_badnets.py` 中的 `/home/yczhang1/...`、`yas.py` 中的 `/tmp/dataset.zip` 全部改为 D 盘本地路径。

## VS Code 配置

项目根目录添加 `.vscode/settings.json`：

```json
{
    "python.defaultInterpreterPath": "C:\\Users\\lh\\miniconda3\\envs\\deephash\\python.exe",
    "python.terminal.activateEnvironment": false,
    "terminal.integrated.profiles.windows": {
        "PowerShell": {
            "source": "PowerShell",
            "args": ["-ExecutionPolicy", "Bypass", "-NoProfile", "-NoLogo"]
        }
    }
}
```

解决了 PowerShell 执行策略限制、旧 venv 激活报错等问题。

## 验证结果

运行 `CSQ_3_16.py`（GTSRB + ResNet50 + 16-bit CSQ 哈希）：

- 数据加载正常：训练 4,988 张 + 测试 989 张 + 数据库 33,293 张
- GPU 正常：CUDA 12.8，利用率 100%
- 训练正常：epoch 10 时 MAP 达到 0.964
- 无警告：无 sm_120 兼容性报错

## 磁盘占用

| 位置 | 大小 | 内容 |
|------|------|------|
| C: `miniconda3\envs\deephash\` | ~7.4GB | Python 环境（含 PyTorch 2.7） |
| D: `deephash_original\` | ~40GB | 代码 + 数据集 |

总计约 50GB，其中 C 盘 7.4GB 是 conda 环境必须的。

## 总结

这次迁移共修复了 **230+ 个文件的配置问题**，涉及路径转换、GPU 适配、显存优化、epoch 调整等。整个过程踩了不少坑，核心经验：

1. **新显卡更要关注 PyTorch 版本**：Blackwell 架构需要 2.7.0+
2. **校园网 + 大 wheel = 放弃 pip**：迅雷比 pip 快得多
3. **批量修改用 sed 别手改**：100+ 文件手动改不现实
4. **原代码可能自带 bug**：train.txt 路径缺 `/` 这种小 bug 在原环境看不出问题
