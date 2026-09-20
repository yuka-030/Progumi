// Progumi/frontend/components/common/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  isLoggedIn: boolean;
};

export default function NavBar({ isLoggedIn }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false); // モーダル表示フラグ

  const handleLogoutConfirm = async () => {
    // httpOnly CookieはJSから直接削除できないのでAPIルート経由で削除
    await fetch("/api/auth/logout", { method: "POST" });
    setShowModal(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (
    href: string, //アクティブ判定
  ) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const linkClass = (href: string) =>
    isActive(href) ? "text-primary font-semibold" : "text-gray-400"; //アクティブなら紫色、そうでなければグレー

  return (
    <>
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card border-b border-pink-100">
       <Link href="/" className="flex flex-col leading-none">
         <span className="text-lg font-bold text-primary">
           プログ<span className="text-accent">ミ</span>
         </span>
         <span className="text-xs text-gray-400 tracking-wider">Progumi</span>
       </Link>

        <div className="flex gap-5 text-sm font-medium">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/glossary" className={linkClass("/glossary")}>
            用語集
          </Link>
          <Link href="/quiz" className={linkClass("/quiz")}>
            クイズ
          </Link>
        </div>

        {isLoggedIn ? (
          <button
            onClick={() => setShowModal(true)}
            className="border border-primary text-primary text-xs font-semibold px-4 py-2 rounded-full"
          >
            ログアウト
          </button>
        ) : (
          <Link
            href="/login"
            className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full"
          >
            ログイン
          </Link>
        )}
      </nav>

      {/* ログアウト確認モーダル */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl p-6 w-80 shadow-lg space-y-4">
            <p className="text-base font-semibold text-foreground text-center">
              ログアウトしますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-full border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
