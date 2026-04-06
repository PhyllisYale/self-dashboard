import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Self Dashboard - 个人管理",
  description: "日程、日记、记账一站式管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50">
        <main className="min-h-screen pb-20 max-w-md mx-auto">
          {children}
        </main>
        <NavBar />
      </body>
    </html>
  );
}