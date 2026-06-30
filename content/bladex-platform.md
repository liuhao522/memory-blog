---
name: bladex-platform
description: BladeX微服务平台完整知识图谱 — 后端架构、前端架构、多租户机制、编译环境
metadata: 
  node_type: memory
  type: project
  tech: 
    - Java 17
    - Spring Boot 3.2
    - MyBatis-Plus
    - Vue 3
    - Vite
    - Element Plus
  date: 2026-06-29
  originSessionId: 9f146a9e-ef34-40ba-b7de-dedc6a30735c
---

# BladeX 平台知识图谱

**版本**: 4.6.0.RELEASE | **开发商**: 上海布雷德科技有限公司 (org.springblade) | **官网**: https://bladex.cn

---

## 后端 (bladex)

**路径**: `D:\voice\bladex` | **分支**: master

### 技术栈
Java 17, Spring Boot 3.2.10, Spring Cloud (Gateway/LoadBalancer), Spring Cloud Alibaba (Nacos 服务发现/配置中心, Sentinel 熔断限流, Seata 分布式事务), Spring Security + OAuth2 (密码/验证码/短信/社交/注册授权), MyBatis-Plus + HikariCP + Druid, MySQL (也支持 PostgreSQL/Oracle/SQL Server/达梦/崖山/人大金仓), Redis, Flowable 工作流, PowerJob 定时任务, Feign + OkHttp, Knife4j/OpenAPI 3, Undertow, Prometheus+Grafana+SkyWalking, ELK, Docker

### 模块结构 (9个顶级Maven模块, ~27个子模块)

**基础设施**
| 模块 | 用途 |
|------|------|
| `blade-gateway/` | API 网关 (Spring Cloud Gateway, 端口80), 动态路由, 认证过滤 |
| `blade-auth/` | OAuth2 认证服务, 支持密码/验证码/短信/社交(GitHub/Gitee/微信/QQ/钉钉)/注册授权 |
| `blade-common/` | 公共工具和共享配置 (缓存/常量/启动器/工具类) |

**运维模块 (blade-ops/)**
| `blade-admin` | Spring Boot Admin 监控 |
| `blade-develop` | 代码生成器 |
| `blade-flow` | 工作流引擎 (Flowable 请假流程) |
| `blade-job` | 分布式任务调度 (PowerJob) |
| `blade-log` | 集中日志收集 |
| `blade-report` | 报表生成 |
| `blade-resource` | 文件/资源管理 (OSS) |

**业务模块 (blade-service/)**
| `blade-system` | 系统管理 (用户/角色/菜单/部门/租户/参数/字典) |
| `blade-desk` | 工作台/通知公告 |
| `blade-device` | 设备管理 |
| `blade-quality` | 质量管理 |
| `blade-record` | 数据审计/变更历史 |
| `blade-talk` | 消息/通讯 |
| `blade-thirdparty` | 第三方集成 |

**API 层**: `blade-ops-api/` + `blade-service-api/` — Feign 接口 + DTO

**插件系统**: `blade-plugin/` 运行时 + `blade-plugin-api/` API

### 关键配置
- Nacos 配置: `doc/nacos/blade.yaml`, `blade-dev.yaml`, `blade-prod.yaml`
- 网关路由: `doc/nacos/routes/blade-gateway-dev.json`
- 数据库脚本: `doc/sql/bladex/` (支持8种数据库)
- Docker 部署: `script/docker/app/docker-compose.yml`
- Maven 私服: https://center.javablade.com

---

## 前端 (saber3)

**路径**: `D:\voice\saber3` | **分支**: master | **项目名称**: 泛简智能工牌平台

### 技术栈
Vue 3.5.13, Vite 5.4.19, Vue Router 4.3.2, Vuex 4.1.0, Vue I18n 11.1.3, Element Plus 2.10.1, Avue 3.7.0 (@smallwei/avue 低代码CRUD框架), Axios 1.8.3, ECharts 6.0.0, SCSS

### 关键库
| 库 | 用途 |
|----|------|
| wavesurfer.js 7.10.1 | 音频波形可视化 |
| @amap/amap-jsapi-loader | 高德地图 |
| codemirror 5.65.16 | 代码编辑器 |
| aieditor 1.4.2 | AI/富文本编辑器 |
| crypto-js / sm-crypto | 加密 (SM2/SM3/SM4 国密) |
| disable-devtool | 开发者工具检测/禁用 |
| @saber/nf-* | BladeX 私有低代码包 (设计/表单) |

### 源码结构 (src/)
| 目录 | 用途 |
|------|------|
| `src/main.js` | 应用入口, 注册全局组件和插件 |
| `src/api/` | API 层 (按业务模块: system/desk/device/quality/flow/job/report/resource/talk/thirdparty/tool/work 等) |
| `src/views/` | 页面组件 (与 api 对应 + analysis/authority/monitor/util/wel) |
| `src/router/` | Vue Router (page/静态, views/视图, avue-router.js 动态路由) |
| `src/store/` | Vuex 模块 (user, common, tags, logs, dict) |
| `src/components/` | 可复用组件 (vocRecord 语音录制播放, code-editor, flow-design 等) |
| `src/page/` | 布局页面 (index/ 主布局, login/ 多模式登录, lock/ 锁屏) |
| `src/config/` | 配置 (website.js 品牌/OAuth2/水印, env.js) |
| `src/utils/` | 工具 (auth, crypto, sm2加密, date, flow, formatter, map, sensitive, storage, validate) |
| `src/styles/` | SCSS 样式 (13种主题: dark/white/star/vip/cool 等) |
| `src/lang/` | i18n (zh.js, en.js) |
| `src/mixins/` | Vue mixins (crud.js 可复用 CRUD 逻辑) |
| `src/option/` | Avue 表格表单配置 |
| `src/permission.js` | 路由守卫 (认证/锁屏/token刷新/标签管理) |
| `src/axios.js` | Axios 实例配置 (拦截器/baseURL/错误处理) |

### 关键配置
- **开发服务器**: 端口 2888
- **API 代理**: `/api` → `http://192.168.0.64`
- **客户端 ID**: `saber3`
- **Token 存储键**: `saber3-access-token`, `saber3-refresh-token`
- **NPM 私服**: https://center.javablade.com/api/packages/blade/npm/ (@saber 命名空间)
- **构建输出**: `dist/` 部署到 Nginx (端口 80/443)

---

## 多租户 (tenant_id)

### 基本定义
- `tenant_id` = 租户ID（SaaS 租户/客户/组织）
- 类型: `VARCHAR(12)`, 默认值 `"000000"`（平台管理员/超级租户）
- 几乎所有业务表都有此字段（用户、部门、角色、菜单、设备、录音、质检等）

### 隔离逻辑
- **管理员租户** (`000000`): 能看到所有租户的数据，管理整个平台
- **普通租户**: 只能看到自己 `tenant_id` 的数据，查询自动带上 `tenant_id` 过滤

### 关键代码
- `TenantConstant.java` (blade-common): 租户常量定义（默认密码、账号额度、菜单集合）
- `TenantController.java` (blade-system): 租户管理 CRUD、数据源配置、产品包配置、域名绑定
- `UserController.java` (blade-system): 用户查询时的租户过滤逻辑

### 权限判断方式
1. **比较 tenant_id 值**: `bladeUser.getTenantId().equals(ADMIN_TENANT_ID)` — `/page` 端点使用
2. **检查角色**: `AuthUtil.isAdministrator()` — `/user-list` 端点使用

### 租户功能
独立数据源（物理隔离）、产品包（功能套餐）、独立域名绑定、账号额度/过期时间

---

## 编译环境

无需打开 IDEA，直接在 bash 中编译。

### 环境变量
```bash
export JAVA_HOME="/d/IntelliJ IDEA 2026.1.2/jbr"
export PATH="$JAVA_HOME/bin:/d/IntelliJ IDEA 2026.1.2/plugins/maven/lib/maven3/bin:$PATH"
```

### 编译命令
```bash
# 编译 blade-record 模块及其依赖
cd D:/voice/bladex
mvn compile -pl blade-service/blade-record -am -q --batch-mode

# 查看编译结果
mvn compile -pl blade-service/blade-record -am --batch-mode 2>&1 | grep -E "BUILD|ERROR"
```

### 已知警告（可忽略）
Google Guice 弃用警告来自 Maven 内部，非项目代码问题:
`WARNING: sun.misc.Unsafe::staticFieldBase has been called by com.google.inject...`

---

## 关联记忆
[[stats-dashboard]] [[checkin-system]] [[voiceprint-system]] [[saber3-desk]] [[stats-performance-tab4]]
