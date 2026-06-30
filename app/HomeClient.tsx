"use client";

import { useState, useMemo } from "react";
import { Post } from "@/lib/types";
import ArticleCard from "@/components/ArticleCard";
import CategoryFilter from "@/components/CategoryFilter";

interface Props {
  posts: Post[];
  categoryCounts: Record<string, number>;
}

export default function HomeClient({ posts, categoryCounts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory) {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tech.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, activeCategory, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          记忆知识库
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
          从本地记忆知识图谱自动生成的个人博客 · {posts.length} 篇文章
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="搜索文章、技术栈..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      {/* Category filter */}
      <CategoryFilter
        active={activeCategory}
        counts={categoryCounts}
        onSelect={setActiveCategory}
      />

      {/* Article grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 dark:text-slate-500 text-lg">
            没有找到匹配的文章
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory(null);
            }}
            className="mt-3 text-sm text-primary-500 hover:text-primary-600 underline"
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
