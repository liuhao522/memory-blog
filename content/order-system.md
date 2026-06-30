---
name: order-system
description: 小型订货系统 — Spring Boot + H2 + Vue3 管理后台 + H5移动端 · 已验收待部署
metadata: 
  node_type: memory
  type: project
  status: done-pending-deploy
  tech: 
    - Spring Boot 2.7
    - H2 (dev) / MySQL (prod)
    - MyBatis-Plus
    - Vue 3 + Element Plus
    - H5 (vanilla HTML/CSS/JS)
    - EasyExcel
    - ZXing QR
  date: 2026-06-30
  budget: ¥3,500
  originSessionId: 57897f0e-fb4f-441b-a321-e510c23665d5
---

# 小型订货系统

**路径**: `D:\order-system\` | **报价**: ¥3,500（含¥200服务器）

## 项目结构
- `backend/` — Spring Boot 后端 (6张表, 25 API)
- `admin-web/` — Vue3 管理后台 (7页面)
- `backend/src/main/resources/static/h5/` — H5下单端 (5页面)

## 启动方式
1. IDEA → Maven面板 → package → Run OrderApplication (:8080)
2. 管理后台: `cd admin-web && npm run dev` (:5173)
3. H5下单: `http://localhost:8080/h5/login.html`

## 账号
- 管理员: admin / admin123
- 用户: 后台创建, 默认密码 123456

## 数据库
- **开发**: H2 内嵌, `backend/data/orderdb.mv.db`
- **生产**: MySQL, 启动参数 `--spring.profiles.active=prod`
- MySQL 建表: `backend/src/main/resources/db/init.sql`

## 全部功能（已验收）

### H5 用户端
- 账号密码登录
- 分类Tab浏览 + 关键词搜索
- 购物车（localStorage）
- 下单
- 待确认订单修改（调数量）
- 取消订单
- 修改密码

### 管理后台
- 仪表盘（10用户/8商品/待确认数/今日金额/近7天趋势）
- 用户CRUD + 重置密码
- 分类CRUD
- 商品CRUD + Excel导入导出
- 订单管理（查询/详情/确认/取消）+ Excel导出
- 按天汇总（同产品合并）+ Excel导出
- 下单二维码

## ⏳ 部署前待做（3项）
1. `application.yml` 切 profiles.active: prod
2. `QRCodeController.java` 的 base-url 改为生产域名
3. `admin-web` build 后 dist 复制到 backend static

## Maven 配置备忘
- 阿里云镜像: pom.xml `<repositories>` + settings.xml `<mirrorOf>*,!bladex</mirrorOf>`
- Java 17 (IDEA JDK 17.0.19)
- 不可用 mvnw.cmd（wrapper jar 已删除），直接用 IDEA Maven
