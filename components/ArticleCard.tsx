import Link from "next/link";
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
    <Link
      href={`/${post.slug}`}
      className="block group p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
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
              className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              {t}
            </span>
          ))}
          {post.tech.length > 5 && (
            <span className="text-xs px-1.5 py-0.5 text-slate-400">
              +{post.tech.length - 5}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
