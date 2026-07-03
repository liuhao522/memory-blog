"use client";

import { motion } from "framer-motion";
import { WORK_EXPERIENCE } from "@/lib/constants";

export default function WorkTimeline() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
        项目经历
      </h2>
      <div className="max-w-lg mx-auto space-y-6">
        {WORK_EXPERIENCE.map((exp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            className="relative pl-8 border-l border-slate-200 dark:border-slate-800"
          >
            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary-500" />
            <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">{exp.period}</div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              {exp.role}
            </h3>
            {exp.company && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{exp.company}</p>
            )}
            <ul className="space-y-1">
              {exp.highlights.map((h, j) => (
                <li key={j} className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-slate-300 dark:text-slate-600 mt-1.5">•</span>
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
