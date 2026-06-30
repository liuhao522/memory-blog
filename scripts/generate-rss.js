const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const BASE_URL = "https://your-domain.pages.dev"; // 部署后更新
const CONTENT_DIR = path.join(__dirname, "..", "content");
const OUTPUT = path.join(__dirname, "..", "public", "feed.xml");

const CATEGORY_MAP = {
  "bladex-platform": "🏗️ 平台基础设施",
  "stats-dashboard": "📊 业务系统",
  "checkin-system": "📊 业务系统",
  "voiceprint-system": "📊 业务系统",
  "smart-badge-platform-user-manual": "📊 业务系统",
  "redis-protoStuff-deserialize-fix": "🐛 故障排查",
  "gold-investment-analysis": "🔬 独立项目",
  "aiai2-smart-badge-ai-platform": "🔬 独立项目",
  "backdoor-defense-paper": "🔬 独立项目",
  "journal-selection-analysis": "🔬 独立项目",
  "order-system": "🔬 独立项目",
  "tools-and-config": "🔧 工具与环境",
};

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function getAllPosts() {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && f !== "MEMORY.md");

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");
      const headingTitle = extractTitle(content);

      let name = headingTitle || data.description || slug;
      if (name.length > 60) name = name.slice(0, 60) + "...";

      return {
        slug,
        name,
        description: data.description || "",
        category: CATEGORY_MAP[slug] || "📝 未分类",
        date: data.metadata?.date || "",
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generate() {
  const posts = getAllPosts();

  const items = posts
    .map(
      (post) => `    <item>
      <title><![CDATA[${post.name}]]></title>
      <link>${BASE_URL}/${post.slug}</link>
      <guid>${BASE_URL}/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <category>${post.category}</category>
      <pubDate>${post.date ? new Date(post.date).toUTCString() : ""}</pubDate>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>记忆知识库</title>
    <link>${BASE_URL}</link>
    <description>基于本地记忆知识图谱搭建的个人博客，涵盖全栈开发、架构设计、投资分析等技术笔记。</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, rss);
  console.log(`✅ RSS generated: ${OUTPUT} (${posts.length} posts)`);
}

generate();
