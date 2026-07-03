// Settings editable via Decap CMS (data/settings.json)
// At build time, Next.js reads this JSON and inlines the values.
// When Decap CMS commits changes, GitHub Actions rebuilds with new values.
import _settingsRaw from "@/data/settings.json";
const _settings = _settingsRaw as Record<string, string>;

export const PERSONAL = {
  name: _settings.name || "Hao Liu",
  title: _settings.title || "Full-Stack Developer",
  tagline:
    _settings.tagline ||
    "云南大学软件工程硕士 · 构建可靠的后端系统，打磨优雅的前端体验",
  bio:
    _settings.bio ||
    `云南大学（211 双一流）软件工程专业硕士，中共党员。
具备扎实的计算机科学基础和企业级后端开发实战经验。
技术栈以 Java Spring Boot 微服务架构为核心，擅长 Redis 高并发优化、MySQL InnoDB 存储引擎调优、AI 大模型应用开发。
深入理解 JVM 内存模型与 GC 机制、JUC 并发编程、分布式系统设计。
热爱技术写作，通过博客持续输出深度技术文章，以此展现思考深度和工程能力。`,
  github: _settings.github || "https://github.com/liuhao522",
  email: _settings.email || "liuhao20012024@163.com",
  phone: _settings.phone || "186-9736-0951",
  location: _settings.location || "云南，中国",
};

export const EDUCATION = {
  school: "云南大学（211 双一流）",
  degree: "软件工程 硕士（专硕）",
  period: "2024.09 - 2027.06",
  highlights: [
    "数学建模竞赛 国家三等奖",
    "数学建模竞赛 省级一等奖",
    "全国大学生软件安全赛 省级二等奖",
    "蓝桥杯大赛 省级三等奖",
    "全国大学生创新大赛 银奖",
  ],
};

export const TECH_STACK = {
  proficient: [
    "Java",
    "Spring Boot 3.2",
    "MyBatis-Plus",
    "MySQL",
    "Redis",
    "Vue 3",
    "TypeScript",
  ],
  comfortable: [
    "Docker",
    "ECharts",
    "Tailwind CSS",
    "Next.js",
    "Linux",
    "Ollama",
    "LangChain4j",
  ],
  familiar: [
    "Python",
    "PyTorch",
    "Kafka",
    "FastAPI",
    "WebSocket",
    "MongoDB",
  ],
};

export const WORK_EXPERIENCE = [
  {
    role: "后端开发工程师（实习）",
    company: "凡见智慧",
    period: "2026.02 - 2026.05",
    highlights: [
      "开发 AI 智能客服系统：用户语音输入 → FunASR 实时转文字 → Ollama 部署 Qwen3.5:9b-128k 模型推理 → Qwen3-TTS 流式语音合成，支持方言交互",
      "攻克 TTS 句子间停顿与音色不一致难题：Qwen3.5 每 token 驱动 TTS 即时合成消除间隙，Web Audio API 零间隙拼接，端到端延迟压缩至 97ms 以内",
      "引入 FlashAttention-2 加速 + 模型预热，单次 TTS 合成耗时控制在 0.3s 内",
      "ASR 从整句转文字优化为实时流式转文字，大幅降低交互等待时间",
    ],
  },
  {
    role: "全栈开发工程师",
    company: "BladeX 微服务平台",
    period: "2024.09 - 至今",
    highlights: [
      "独立设计和开发统计大屏系统：5 个 Tab、12 张数据表跨库查询、9 个关键架构设计决策",
      "打卡系统 v1→v3 架构演进：从 60 秒轮询到事件驱动的实时 GPS 地理围栏检测",
      "Redis ProtoStuff 反序列化故障排查：跨越 7 层调用链定位跨租户缓存污染根因",
      "声纹识别系统跳过未注册优化，避免无效 API 调用",
    ],
  },
];

export const PROJECTS = [
  {
    title: "AI 智能客服系统",
    period: "2026.02 - 2026.05",
    role: "后端开发",
    highlights: [
      "语音输入 → ASR 实时转文字 → Qwen3.5:9b 大模型推理 → TTS 流式语音合成",
      "攻克 TTS 停顿与音色不一致，端到端延迟 < 97ms",
      "FlashAttention-2 加速 + 模型预热，单次合成 < 0.3s",
    ],
    tech: ["FunASR", "Ollama", "Qwen3-TTS", "FastAPI", "WebSocket", "PyTorch"],
  },
  {
    title: "优选生活服务平台",
    period: "2024.02 - 2024.10",
    role: "Java 后端开发",
    highlights: [
      "Redis + Lua 优惠券秒杀：一人一单 + 异步下单 + 多级缓存 + 多维度限流",
      "布隆过滤器防穿透、动态 TTL 防雪崩、互斥锁防击穿、Caffeine + Redis 二级缓存",
      "Redis BitMap 签到、ZSet Feed 流推送、JWT + Redis 黑名单鉴权",
    ],
    tech: ["Spring Boot", "Redis", "Lua", "MySQL", "Caffeine", "Kafka"],
  },
  {
    title: "智慧教育 AI 学习系统",
    period: "2025.12 - 2026.03",
    role: "Java 后端",
    highlights: [
      "Chroma 向量数据库 + LangChain4j RAG 框架，构建垂直初中教育的智能答疑助手",
      "教师/学生差异化 Prompt Template，有效解决大模型信息幻觉与专业领域不准确问题",
      "历史对话上下文压缩 + 问题重写，提升大模型回答精准度",
    ],
    tech: ["LangChain4j", "Qwen3", "Spring Boot", "Chroma", "Ollama"],
  },
];

export const HONORS = [
  "数学建模竞赛 国家三等奖",
  "数学建模竞赛 省级一等奖",
  "中科院二区论文（后门防御方向）",
  "全国大学生软件安全赛 省级二等奖",
  "蓝桥杯大赛 省级三等奖",
  "全国大学生创新大赛 银奖",
  "英语六级",
  "国家励志奖学金",
  "省级三好学生",
];
