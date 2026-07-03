"use client";

import { motion } from "framer-motion";
import { PERSONAL } from "@/lib/constants";

const links = [
  {
    label: "GitHub",
    url: PERSONAL.github,
    desc: "github.com/liuhao522",
  },
  {
    label: "Email",
    url: `mailto:${PERSONAL.email}`,
    desc: PERSONAL.email,
  },
  {
    label: "Phone",
    url: `tel:${PERSONAL.phone}`,
    desc: PERSONAL.phone,
  },
];

export default function ContactLinks() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
        Contact
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto"
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500/30 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-slate-900/50"
          >
            <span className="text-xs font-semibold text-slate-900 dark:text-white">{link.label}</span>
            <span className="text-xs text-slate-400">{link.desc}</span>
          </a>
        ))}
      </motion.div>
    </div>
  );
}
