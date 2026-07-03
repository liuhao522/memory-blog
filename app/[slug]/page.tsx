import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/posts";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import Comments from "@/components/Comments";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article Not Found" };

  return {
    title: post.name,
    description: post.description,
    keywords: [...post.tech, post.category.replace(/[^\w]/g, ""), "技术博客", "Hao Liu"],
    openGraph: {
      title: post.name,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <ReadingProgress />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mb-6 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="flex gap-10">
          {/* Main content */}
          <div className="min-w-0 flex-1 max-w-3xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-500/20">
                  {post.category}
                </span>
                {post.date && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(post.date)}
                  </span>
                )}
                {post.readingTime && (
                  <span className="text-xs text-slate-400 dark:text-slate-600">· {post.readingTime} read</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                {post.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                {post.description}
              </p>
              {post.tech.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {post.tech.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 mb-8" />

            <MarkdownRenderer content={post.content} />

            <Comments />
          </div>

          {/* Sidebar TOC */}
          <TableOfContents content={post.content} />
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
      <BackToTop />
    </>
  );
}
