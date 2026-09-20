// Progumi/frontend/app/api/quiz/history/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.INTERNAL_API_URL;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

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

    const response = await fetch(`${API_BASE_URL}/api/quiz/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
