// Progumi/frontend/app/admin/page.tsx
import { getAdminStats } from "@/lib/api/admin";
import { cookies } from "next/headers";
import Link from "next/link";

// Server Componentとして動作し、管理者統計情報をAPIから取得する
export default async function AdminDashboardPage() {
  // CookieからJWTトークンを取得してAPIに渡す
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? "";

  let stats = { totalUsers: 0, totalTerms: 0 };
  let error = false;

  try {
    stats = await getAdminStats(token);
  } catch {
    // 統計情報取得失敗時はエラー表示
    error = true;
  }

  return (
    <div className="space-y-8">
      {/* 統計情報 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-pink-100">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            総ユーザー数
          </p>
          <p className="text-3xl font-bold mt-2 text-foreground">
            {error ? (
              <span className="text-sm text-red-400">取得失敗</span>
            ) : (
              <>
                {stats.totalUsers}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  人
                </span>
              </>
            )}
          </p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-pink-100">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            総登録用語数
          </p>
          <p className="text-3xl font-bold mt-2 text-foreground">
            {error ? (
              <span className="text-sm text-red-400">取得失敗</span>
            ) : (
              <>
                {stats.totalTerms}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  語
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* 管理メニュー */}
      <div>
        <h2 className="text-lg font-bold mb-4">管理メニュー</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/terms" className="group">
            <div className="bg-card p-6 rounded-2xl border border-pink-100 hover:border-primary hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  文
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  用語管理（登録・編集・削除）
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  プログラミング用語の追加、既存用語の編集、不要になったデータの削除を行います。
                </p>
              </div>
              <div className="mt-6 text-sm font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                一覧を開く &rarr;
              </div>
            </div>
          </Link>

          <div className="bg-card p-6 rounded-2xl border border-pink-100 opacity-60 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center font-bold text-xl mb-4">
                鍵
              </div>
              <h3 className="text-base font-bold text-gray-400 mb-2">
                権限管理（マスター）
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                一般ユーザーへの管理者権限の付与や、アカウントのステータス管理を行います。（今後のアップデートで追加予定）
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
