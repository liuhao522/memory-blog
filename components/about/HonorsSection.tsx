"use client";

import { motion } from "framer-motion";
import { HONORS, EDUCATION } from "@/lib/constants";

export default function HonorsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
        Honors & Awards
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-lg mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EDUCATION.highlights.map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              {h}
            </div>
          ))}
          {HONORS.filter(h => !EDUCATION.highlights.some(eh => h.includes(eh.slice(0, 6)))).map((h, i) => (
            <div
              key={`h-${i}`}
              className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {h}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
