// Progumi/frontend/app/api/quiz/remaining/route.ts
// 残り挑戦回数取得のRoute Handler
// httpOnly CookieのJWTをサーバー側で取得してバックエンドへ転送する
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.INTERNAL_API_URL;

export async function GET() {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: "サーバー設定エラー（API URL未設定）" },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const guestToken = cookieStore.get("quiz_guest_token")?.value;

    const headers: Record<string, string> = {};

    // ログイン済みの場合はJWTを付与
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // ゲストトークンがあればCookieヘッダーで転送
    if (guestToken) {
      headers["Cookie"] = `quiz_guest_token=${guestToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz/remaining`, {
      headers,
    });

    const data = await response.json();

    // バックエンドが発行した新しいguest_tokenをフロントに転送
    const setCookie = response.headers.get("set-cookie");
    const nextResponse = NextResponse.json(data, { status: response.status });
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}
