import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { inter, mono } from "./fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "highlight.js/styles/github-dark.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hao Liu · Full-Stack Developer",
    template: "%s | Hao Liu",
  },
  description:
    "全栈工程师 · 专注于复杂业务系统的架构设计与性能优化。Java Spring Boot + Vue 3 技术栈，热爱技术写作与开源分享。",
  keywords: [
    "全栈工程师",
    "Java",
    "Spring Boot",
    "Vue 3",
    "TypeScript",
    "微服务",
    "技术博客",
    "BladeX",
  ],
  authors: [{ name: "Hao Liu" }],
  creator: "Hao Liu",
  openGraph: {
    title: "Hao Liu · Full-Stack Developer",
    description: "全栈工程师 · 复杂业务系统架构与性能优化",
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
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable}`}
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Hao Liu RSS"
          href="/feed.xml"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
