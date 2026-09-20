// Progumi/frontend/app/api/admin/terms/[id]/route.ts
// 用語詳細取得・更新・削除APIのRoute Handler
// httpOnly CookieのJWTをサーバー側で取得してバックエンドへ転送する
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.INTERNAL_API_URL;

// 🔧 --- 共通処理：トークン取得 ---
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

// 🔍 --- 用語詳細取得 ---
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Next.js App RouterではparamsがPromiseのため、awaitで展開する
    const { id } = await params;

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

    const response = await fetch(`${API_BASE_URL}/terms/${id}`, {
      headers: {
        // JWTをBearerトークンとして付与
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}

// ✏️ --- 用語更新 ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Next.js App RouterではparamsがPromiseのため、awaitで展開する
    const { id } = await params;

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

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/terms/${id}`, {
      method: "PUT",
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

// 🗑️ --- 用語削除 ---
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Next.js App RouterではparamsがPromiseのため、awaitで展開する
    const { id } = await params;

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

    const response = await fetch(`${API_BASE_URL}/terms/${id}`, {
      method: "DELETE",
      headers: {
        // JWTをBearerトークンとして付与（管理者権限チェックに使用）
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}
