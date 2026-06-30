import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "记忆知识库 — 个人技术博客",
    template: "%s | 记忆知识库",
  },
  description:
    "基于本地记忆知识图谱搭建的个人博客，涵盖 BladeX 微服务平台、统计大屏、打卡系统、声纹系统、黄金投资分析等技术笔记。",
  keywords: [
    "BladeX",
    "Spring Boot",
    "Vue 3",
    "微服务",
    "知识图谱",
    "技术博客",
    "Java",
    "TypeScript",
  ],
  authors: [{ name: "lh" }],
  openGraph: {
    title: "记忆知识库 — 个人技术博客",
    description: "基于本地记忆知识图谱搭建的个人博客，涵盖全栈开发、架构设计、投资分析等技术笔记。",
    type: "website",
    locale: "zh_CN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="记忆知识库 RSS"
          href="/feed.xml"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
