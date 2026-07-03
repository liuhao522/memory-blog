"use client";

import { motion } from "framer-motion";
import { TECH_STACK } from "@/lib/constants";
import { staggerContainer } from "@/lib/animations";

const categories = [
  { key: "proficient", label: "精通", color: "primary" },
  { key: "comfortable", label: "熟练", color: "purple" },
  { key: "familiar", label: "了解", color: "slate" },
] as const;

const colorMap: Record<string, string> = {
  primary: "border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/5 text-primary-700 dark:text-primary-300",
  purple: "border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/5 text-purple-700 dark:text-purple-300",
  slate: "border-slate-200 dark:border-slate-600/50 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400",
};

const headerMap: Record<string, string> = {
  primary: "text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/30",
  purple: "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
  slate: "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600/30",
};

export default function TechStackSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
        技术栈
      </h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {categories.map(({ key, label, color }) => (
          <motion.div
            key={key}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-6"
          >
            <h3 className={`text-sm font-semibold mb-4 pb-3 border-b ${headerMap[color]}`}>
              {label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK[key].map((tech) => (
                <span
                  key={tech}
                  className={`px-2.5 py-1 text-xs rounded-lg border ${colorMap[color]}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
