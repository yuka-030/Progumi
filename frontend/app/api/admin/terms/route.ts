// Progumi/frontend/app/api/admin/terms/route.ts
// 用語登録APIのRoute Handler
// httpOnly CookieのJWTをサーバー側で取得してバックエンドへ転送する
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.INTERNAL_API_URL;

// 🔧 --- 共通処理：トークンとAPI URL の検証 ---
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

// 📋 --- 用語一覧取得 ---
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: "サーバー設定エラー（API URL未設定）" },
        { status: 500 },
      );
    }

    // クエリパラメータをそのまま転送
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();

    const response = await fetch(
      `${API_BASE_URL}/terms${query ? `?${query}` : ""}`,
      {
        headers: {
          // JWTをBearerトークンとして付与（管理者権限チェックに使用）
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}

// ➕ --- 用語登録 ---
export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: "サーバー設定エラー（API URL未設定）" },
        { status: 500 },
      );
    }

    // クライアントから受け取ったリクエストボディをそのまま転送
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/terms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // JWTをBearerトークンとして付与（管理者権限チェックに使用）
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}
