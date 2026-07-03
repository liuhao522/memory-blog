"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  { value: "3+", label: "年经验" },
  { value: "5+", label: "项目构建" },
  { value: "16+", label: "技术文章" },
];

const badges = [
  "Java", "Spring Boot", "Vue 3", "TypeScript",
  "MySQL", "Redis", "Docker", "ECharts", "Next.js",
];

export default function HeroSection() {
  return (
    <div className="max-w-3xl mx-auto text-center py-16 sm:py-24 px-4">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 tracking-wide uppercase"
      >
        Hey, I&apos;m
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4"
      >
        <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 bg-clip-text text-transparent">
          Hao Liu
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-6 sm:mb-8 px-4"
      >
        全栈工程师 · 复杂业务系统的架构设计与性能优化
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-center gap-6 sm:gap-8 mb-8 sm:mb-10"
      >
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 px-2"
      >
        {badges.map((badge) => (
          <span
            key={badge}
            className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300"
          >
            {badge}
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex justify-center gap-3 sm:gap-4"
      >
        <a
          href="#projects"
          className="px-5 sm:px-6 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm transition-colors"
        >
          查看项目
        </a>
        <Link
          href="/about"
          className="px-5 sm:px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors"
        >
          关于我
        </Link>
      </motion.div>
    </div>
  );
}
