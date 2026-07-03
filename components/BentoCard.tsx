"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface BentoCardProps {
  slug: string;
  title: string;
  highlight: string;
  category: string;
  tech?: string[];
  size?: "large" | "medium" | "small";
}

const sizeClasses: Record<string, string> = {
  large: "col-span-1 sm:col-span-2 row-span-2 p-6",
  medium: "col-span-1 row-span-1 p-5",
  small: "col-span-1 row-span-1 p-4",
};

export default function BentoCard({
  slug,
  title,
  highlight,
  category,
  tech,
  size = "medium",
}: BentoCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={`/${slug}`}
        className={`block h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-sm hover:border-primary-400 dark:hover:border-primary-500/30 transition-colors group ${sizeClasses[size]}`}
      >
        <div className="flex flex-col h-full justify-between gap-3">
          <div>
            <span className="text-xs text-primary-500 dark:text-primary-400 font-medium uppercase tracking-wider">
              {category}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
              {highlight}
            </p>
          </div>
          {tech && size === "large" && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {tech.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
