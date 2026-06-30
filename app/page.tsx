import { getAllPosts } from "@/lib/posts";
import HomeClient from "./HomeClient";

export default function HomePage() {
  const posts = getAllPosts();

  const categoryCounts: Record<string, number> = {};
  posts.forEach((p) => {
    categoryCounts[p.categorySlug] =
      (categoryCounts[p.categorySlug] || 0) + 1;
  });

  return <HomeClient posts={posts} categoryCounts={categoryCounts} />;
}
