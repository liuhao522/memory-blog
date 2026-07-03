"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Post } from "@/lib/types";

interface Props {
  post: Post;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ArticleCard({ post }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/${post.slug}`}
        className="block group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-sm hover:border-primary-400 dark:hover:border-primary-500/30 transition-all duration-200 h-full"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-500/20">
            {post.category}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {formatDate(post.date)}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1.5 line-clamp-1">
          {post.name}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {post.description}
        </p>
        {post.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tech.slice(0, 5).map((t) => (
              <span
                key={t}
                className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500"
              >
                {t}
              </span>
            ))}
            {post.tech.length > 5 && (
              <span className="text-xs px-1.5 py-0.5 text-slate-400 dark:text-slate-600">
                +{post.tech.length - 5}
              </span>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
