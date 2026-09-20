// Progumi/frontend/app/layout.tsx
import NavBar from "@/components/common/NavBar";
import { getIsLoggedIn } from "@/lib/auth";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-zen-maru",
});

export const metadata: Metadata = {
  title: "プログミ | Progumi",
  description: "IT用語を学習するための学習支援アプリ",
};

// Server Componentとして動作し、CookieからログインJWTを検証する
// NavBarにisLoggedInを渡すことで、ログイン・ログアウトボタンの表示を切り替える
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // サーバーサイドでログイン状態を取得
  const isLoggedIn = await getIsLoggedIn();

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${zenMaruGothic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        {/* ログイン状態をNavBarに渡してUIを切り替える */}
        <NavBar isLoggedIn={isLoggedIn} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
