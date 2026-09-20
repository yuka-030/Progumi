// Progumi/frontend/lib/auth.ts
// サーバーサイドでログイン状態を確認するユーティリティ
// Server Component や layout.tsx から呼び出して使用する
// クライアントサイドでは使用不可（next/headersはサーバー専用）
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * CookieのJWTを検証し、ログイン状態を返す
 * @returns ログイン済みの場合 true、未認証・トークン不正の場合 false
 */
export async function getIsLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // Cookieにトークンが存在しない場合は未認証
  if (!token) return false;

  try {
    // JWTの署名を検証（改ざん・期限切れチェック）
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    await jwtVerify(token, secret);
    return true;
  } catch (e) {
    // 検証失敗（期限切れ・不正なトークン）は未認証扱い
    return false;
  }
}

/**
 * CookieのJWTを検証し、ユーザーのroleを返す
 * @returns roleの文字列、未認証・トークン不正の場合 null
 */
export async function getRole(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}
