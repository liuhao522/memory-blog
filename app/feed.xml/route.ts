import { getAllPosts } from "@/lib/posts";

const BASE_URL = "https://memory-blog-seven.vercel.app";

export async function GET() {
  const posts = getAllPosts();

  const items = posts
    .map(
      (post) => `
    <item>
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

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
