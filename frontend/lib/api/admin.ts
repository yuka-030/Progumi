// Progumi/frontend/lib/api/admin.ts
// 管理者ダッシュボード用のAPI呼び出し処理
// Server Componentから呼び出して使用する

type AdminStats = {
  totalUsers: number; // 総ユーザー数
  totalTerms: number; // 総登録用語数
};

/**
 * 管理者ダッシュボード用の統計情報を取得する
 * @param token CookieのJWTトークン（Server Componentから渡す）
 * @returns 総ユーザー数・総登録用語数
 */
export async function getAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${process.env.INTERNAL_API_URL}/api/admin/stats`, {
    headers: {
      // JWTをBearerトークンとしてバックエンドに送信
      Authorization: `Bearer ${token}`,
    },
    // リクエストごとに最新データを取得
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("統計情報の取得に失敗しました");
  }

  return res.json();
}
