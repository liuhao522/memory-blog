import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400 dark:text-slate-500">
        <p>&copy; 2026 Hao Liu. All rights reserved.</p>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">首页</Link>
          <Link href="/about" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">关于</Link>
          <a href="https://github.com/liuhao522" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">GitHub</a>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">Built with Next.js 15</span>
        </div>
      </div>
    </footer>
  );
}
