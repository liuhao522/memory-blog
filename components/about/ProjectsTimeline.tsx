"use client";

import { motion } from "framer-motion";
import { PROJECTS } from "@/lib/constants";

export default function ProjectsTimeline() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
        项目作品
      </h2>
      <div className="max-w-lg mx-auto space-y-6">
        {PROJECTS.map((project, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            className="relative pl-8 border-l border-slate-200 dark:border-slate-800"
          >
            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500" />
            <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">{project.period}</div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              {project.title}
            </h3>
            <p className="text-sm text-primary-500 dark:text-primary-400 mb-2">{project.role}</p>
            <ul className="space-y-1 mb-3">
              {project.highlights.map((h, j) => (
                <li key={j} className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-slate-300 dark:text-slate-600 mt-1.5">&bull;</span>
                  {h}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
