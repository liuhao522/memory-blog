"use client";

import { motion } from "framer-motion";
import { PERSONAL } from "@/lib/constants";

export default function GitHubStats() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
        GitHub
      </h2>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2 mb-6"
      >
        <img
          src={`https://github-readme-stats.vercel.app/api?username=liuhao522&show_icons=true&theme=tokyonight&hide_border=true&bg_color=0d1117&title_color=818cf8&icon_color=818cf8&text_color=cbd5e1`}
          alt="GitHub Stats"
          className="rounded-xl w-full sm:w-auto max-w-[400px] mx-auto sm:mx-0"
          loading="lazy"
        />
        <img
          src={`https://github-readme-stats.vercel.app/api/top-langs/?username=liuhao522&layout=compact&theme=tokyonight&hide_border=true&bg_color=0d1117&title_color=818cf8&text_color=cbd5e1`}
          alt="Top Languages"
          className="rounded-xl w-full sm:w-auto max-w-[400px] mx-auto sm:mx-0"
          loading="lazy"
        />
      </motion.div>

      {/* Contribution graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-2xl mx-auto px-2"
      >
        <img
          src={`https://ghchart.rshah.org/liuhao522`}
          alt="GitHub Contribution Graph"
          className="rounded-xl w-full border border-slate-200 dark:border-slate-800"
          loading="lazy"
          style={{ backgroundColor: "#0d1117" }}
        />
      </motion.div>

      <p className="text-center mt-6">
        <a
          href={PERSONAL.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          github.com/liuhao522 &rarr;
        </a>
      </p>
    </div>
  );
}
