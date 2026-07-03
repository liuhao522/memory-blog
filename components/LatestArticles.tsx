"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { staggerContainer } from "@/lib/animations";
import { Post } from "@/lib/types";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

interface LatestArticlesProps {
  posts: Post[];
}

export default function LatestArticles({ posts }: LatestArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">最新文章</h2>
        <Link
          href="/category/project"
          className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          查看全部 →
        </Link>
      </div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="space-y-4"
      >
        {posts.slice(0, 3).map((post) => (
          <motion.div
            key={post.slug}
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
            whileHover={{ x: 6 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={`/${post.slug}`}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-primary-400 dark:hover:border-primary-500/20 transition-colors group"
            >
              <time className="text-xs text-slate-400 dark:text-slate-500 w-24 shrink-0 pt-0.5">
                {formatDate(post.date)}
              </time>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors line-clamp-1">
                  {post.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {post.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
