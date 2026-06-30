export interface PostMeta {
  slug: string;
  name: string;
  description: string;
  category: string;
  type: string;
  tech: string[];
  date: string;
}

export interface Post extends PostMeta {
  content: string;
  categorySlug: string;
}

export const CATEGORIES = [
  { key: "platform", label: "🏗️ 平台基础设施", slug: "platform" },
  { key: "business", label: "📊 业务系统", slug: "business" },
  { key: "troubleshoot", label: "🐛 故障排查", slug: "troubleshoot" },
  { key: "project", label: "🔬 独立项目", slug: "project" },
  { key: "tools", label: "🔧 工具与环境", slug: "tools" },
] as const;

export const CATEGORY_MAP: Record<string, (typeof CATEGORIES)[number]> = {
  "bladex-platform": CATEGORIES[0],
  "stats-dashboard": CATEGORIES[1],
  "checkin-system": CATEGORIES[1],
  "voiceprint-system": CATEGORIES[1],
  "smart-badge-platform-user-manual": CATEGORIES[1],
  "redis-protoStuff-deserialize-fix": CATEGORIES[2],
  "gold-investment-analysis": CATEGORIES[3],
  "aiai2-smart-badge-ai-platform": CATEGORIES[3],
  "backdoor-defense-paper": CATEGORIES[3],
  "journal-selection-analysis": CATEGORIES[3],
  "order-system": CATEGORIES[3],
  "tools-and-config": CATEGORIES[4],
};
