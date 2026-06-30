import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1">
          <span>由</span>
          <Link href="/" className="text-primary-500 hover:text-primary-600 font-medium">
            记忆知识库
          </Link>
          <span>生成 · 基于本地 Markdown 文件</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            首页
          </Link>
          <span>·</span>
          <span>Next.js 15 + Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}
