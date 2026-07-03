export interface PostMeta {
  slug: string;
  name: string;
  description: string;
  category: string;
  type: string;
  tech: string[];
  date: string;
  featured?: boolean;
  highlight?: string;
  readingTime?: string;
}

export interface Post extends PostMeta {
  content: string;
  categorySlug: string;
}

export const CATEGORIES = [
  { key: "platform", label: "Platform", slug: "platform" },
  { key: "business", label: "Business", slug: "business" },
  { key: "troubleshoot", label: "Troubleshooting", slug: "troubleshoot" },
  { key: "project", label: "Projects", slug: "project" },
  { key: "tools", label: "Tools", slug: "tools" },
] as const;

export const CATEGORY_MAP: Record<string, (typeof CATEGORIES)[number]> = {
  "bladex-platform": CATEGORIES[0],
  "stats-dashboard": CATEGORIES[1],
  "checkin-system": CATEGORIES[1],
  "voiceprint-system": CATEGORIES[1],
  "smart-badge-platform-user-manual": CATEGORIES[1],
  "redis-protoStuff-deserialize-fix": CATEGORIES[2],
  "aiai2-smart-badge-ai-platform": CATEGORIES[3],
  "backdoor-defense-paper": CATEGORIES[3],
  "journal-selection-analysis": CATEGORIES[3],
  "order-system": CATEGORIES[3],
  "tools-and-config": CATEGORIES[4],
  "seckill-system-design": CATEGORIES[3],
  "redis-bitmap-checkin": CATEGORIES[3],
  "feed-push-architecture": CATEGORIES[3],
};
