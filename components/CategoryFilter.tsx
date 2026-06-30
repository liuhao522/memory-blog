"use client";

import { CATEGORIES } from "@/lib/types";

interface Props {
  active: string | null;
  counts: Record<string, number>;
  onSelect: (slug: string | null) => void;
}

export default function CategoryFilter({ active, counts, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onSelect(null)}
        className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
          active === null
            ? "bg-primary-500 text-white border-primary-500 shadow-sm"
            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-slate-800"
        }`}
      >
        全部
        <span className="ml-1 text-xs opacity-70">
          {Object.values(counts).reduce((a, b) => a + b, 0)}
        </span>
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onSelect(cat.slug)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
            active === cat.slug
              ? "bg-primary-500 text-white border-primary-500 shadow-sm"
              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-slate-800"
          }`}
        >
          {cat.label}
          {counts[cat.slug] ? (
            <span className="ml-1 text-xs opacity-70">{counts[cat.slug]}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
