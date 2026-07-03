"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import BentoCard from "./BentoCard";
import { Post } from "@/lib/types";

interface BentoGridProps {
  featuredPosts: Post[];
}

export default function BentoGrid({ featuredPosts }: BentoGridProps) {
  const projects = featuredPosts.slice(0, 6).map((p, i) => {
    const sizes: Array<"large" | "medium" | "small"> = [
      "large",
      "medium",
      "medium",
      "small",
      "small",
      "small",
    ];

    return {
      slug: p.slug,
      title: p.name,
      highlight: p.highlight || p.description,
      category: p.category,
      tech: p.tech,
      size: sizes[i] || "small",
    };
  });

  return (
    <div id="projects" className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Projects</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Each project represents deep technical thinking — from architecture to debugging.
        </p>
      </div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr"
      >
        {projects.map((p) => (
          <BentoCard
            key={p.slug}
            {...p}
            size={p.size as "large" | "medium" | "small"}
          />
        ))}
      </motion.div>
    </div>
  );
}
