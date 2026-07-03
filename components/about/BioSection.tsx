"use client";

import { motion } from "framer-motion";
import { PERSONAL, EDUCATION } from "@/lib/constants";

export default function BioSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Name + basic info */}
      <div className="text-center mb-10">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-primary-500/30 shadow-lg shadow-primary-500/10">
          <img
            src="/memory-blog/avatar.jpg"
            alt="Hao Liu"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{PERSONAL.name}</h1>
        <p className="text-primary-500 font-medium mb-2">{PERSONAL.title}</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">{PERSONAL.location} · {PERSONAL.email}</p>
        {/* Resume download */}
        <a
          href="/memory-blog/resume.pdf"
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium border border-primary-500/20 hover:bg-primary-500/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          下载简历
        </a>
      </div>

      {/* Bio */}
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line text-sm sm:text-base">
          {PERSONAL.bio}
        </p>
      </div>

      {/* Education */}
      <div className="max-w-lg mx-auto mt-10 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Education</h3>
        <p className="text-base font-medium text-slate-800 dark:text-slate-200">{EDUCATION.school}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{EDUCATION.degree}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{EDUCATION.period}</p>
      </div>
    </motion.div>
  );
}
