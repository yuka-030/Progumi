// Progumi/frontend/app/page.tsx
import ActivityFeed from "@/components/top/ActivityFeed";
import HeroSection from "@/components/top/HeroSection";
import MenuCard from "@/components/top/MenuCard";
import { getIsLoggedIn, getRole } from "@/lib/auth";
import Link from "next/link";

// ログイン状態はリクエストごとに変わるため、キャッシュを無効化
export const dynamic = "force-dynamic";

// Server Componentとして動作し、ログイン状態をCookieから取得する
export default async function Home() {
  // サーバーサイドでログイン状態を取得
  const isLoggedIn = await getIsLoggedIn();
  const role = await getRole(); // adminユーザー確認

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-18">
      <HeroSection />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MenuCard
          href="/glossary"
          title="用語集"
          description="エンジニア用語をわかりやすく学ぼう"
          icon="📖"
          color="primary"
        />
        <MenuCard
          href="/quiz"
          title="クイズ"
          description="問題を解いて知識を定着させよう"
          icon="🧩"
          color="accent"
        />
      </div>

      {/* ログイン時のみActivityFeedを表示 */}
      {isLoggedIn && (
        <div className="pt-8">
          <ActivityFeed isLoggedIn={isLoggedIn} />
        </div>
      )}

      {/* adminユーザーのみ管理画面リンクを表示 */}
      {role === "admin" && (
        <Link
          href="/admin"
          className="block w-full text-center py-3 px-6 bg-primary text-white text-sm font-bold rounded-2xl"
        >
          ⚙️ 管理画面へ
        </Link>
      )}
    </div>
  );
}
