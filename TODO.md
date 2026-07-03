# Blog TODO — Remaining Work

## Priority 1 — Must Do (面试前必做)

- [ ] **个人照片**: 替换 about 页 "HL" 头像为真实照片 (`public/avatar.png`)
- [ ] **简历下载**: 放 PDF 简历到 `public/resume.pdf`，about 页加下载按钮
- [ ] **重写 3 篇核心文章**（从知识库改成技术复盘）:
  - [ ] `stats-dashboard.md` — "从零构建复杂数据大屏：5 Tab、12 表、23 Bug"
  - [ ] `checkin-system.md` — "GPS 打卡系统 v1→v3：60s 轮询到事件驱动"
  - [ ] `redis-protoStuff-deserialize-fix.md` — "ProtoBuf 缓存污染 7 层排查"
- [ ] **GitHub Pages 部署**: `git push` 上线到 `liuhao522.github.io/memory-blog`

## Priority 2 — Important (加分项)

- [ ] **项目截图/GIF**: Bento 卡片加演示图，先截图放到 `public/projects/`
- [ ] **代码高亮**: `MarkdownRenderer.tsx` 集成 `rehype-highlight`（已安装未使用）
- [ ] **OG 社交分享图**: `scripts/generate-og-images.js` 按模板生成
- [ ] **文章目录 (TOC)**: 长文章自动生成侧边目录
- [ ] **SEO**: 加 `sitemap.xml`、完善各页面 keywords
- [ ] **阅读进度条**: 文章页顶部进度指示器

## Priority 3 — Nice to Have (锦上添花)

- [ ] **回到顶部按钮**: 浮动按钮，滚动超过一屏时出现
- [ ] **文章阅读量**: 用 GitHub API 或 Supabase 计数
- [ ] **RSS 更新**: 适配新文章内容格式
- [ ] **清理旧文章**: 移除 `daily-2026-07-01.md` 等低质量日志文章
- [ ] **about 页项目时间线**: 展示 3 个独立项目 (AI客服/优选生活/智慧教育)
- [ ] **GitHub contribution graph**: about 页嵌入 GitHub 贡献热力图
- [ ] **文章标签页**: 按 tech stack 筛选文章

## Tech Debt

- [ ] `rehype-highlight` 已安装但未在 MarkdownRenderer 使用
- [ ] `stats-dashboard-optimization-20260702.md` 缺失 CategoryFilter -> Uncategorized
- [ ] RSS 脚本 `generate-rss.js` 可能需要适配新 category 命名
- [ ] 部分旧文章 frontmatter 缺少 `featured` / `highlight` 字段
