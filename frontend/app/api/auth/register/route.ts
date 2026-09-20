// Progumi/frontend/app/api/auth/register/route.ts
// 新規登録APIのRoute Handler
// バックエンドの /auth/signup へリクエストを転送する
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.INTERNAL_API_URL;

export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: "サーバー設定エラー（API URL未設定）" },
        { status: 500 },
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}