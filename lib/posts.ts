import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post, CATEGORY_MAP } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

/* Extract the first H1 heading from markdown content */
function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && f !== "MEMORY.md");

  const posts = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data, content } = matter(raw);

      const slug = file.replace(/\.md$/, "");
      const categoryInfo = CATEGORY_MAP[slug] || {
        key: "project",
        label: "📝 未分类",
        slug: "project",
      };

      // Priority: H1 heading > frontmatter name (if not same as slug) > description > slug
      const headingTitle = extractTitle(content);
      let displayName: string;
      if (headingTitle) {
        displayName = headingTitle;
      } else if (data.name && !data.name.toLowerCase().includes(slug.toLowerCase()) && !slug.toLowerCase().includes(data.name.toLowerCase())) {
        displayName = data.name;
      } else if (data.description && data.description.length < 60) {
        displayName = data.description;
      } else {
        displayName = slug;
      }

      return {
        slug,
        name: displayName,
        description: data.description || "",
        category: categoryInfo.label,
        categorySlug: categoryInfo.slug,
        type: data.metadata?.type || "project",
        tech: data.metadata?.tech || [],
        date: data.metadata?.date || "",
        content,
      } as Post;
    })
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export function getPostsByCategory(
  categorySlug: string
): Post[] {
  return getAllPosts().filter((p) => p.categorySlug === categorySlug);
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
