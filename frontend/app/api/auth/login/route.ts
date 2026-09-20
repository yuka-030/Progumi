// Progumi/frontend/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

// ログインAPI
export async function POST(request: NextRequest) {
  try {
    // フロントから送信されたメールアドレスとパスワードを取得
    const body = await request.json();

    // FastAPI の OAuth2PasswordRequestForm 用に form-data を作成
    const formData = new URLSearchParams();

    // FastAPI 側では username にメールアドレスを渡す仕様
    formData.append("username", body.email);

    // パスワード
    formData.append("password", body.password);

    // バックエンドのログインAPIへリクエストを転送
    const response = await fetch(`${process.env.INTERNAL_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    // バックエンドからのレスポンスを取得
    const data = await response.json();

    // -------------------------------------------------------------
    // 認証成功条件の統一
    // response.ok かつ access_token が存在する場合のみ成功扱い
    // -------------------------------------------------------------
    if (response.ok && data?.access_token) {
      const nextResponse = NextResponse.json(
        {
          user_id: data.user_id,
          role: data.role,
        },
        {
          status: response.status,
        },
      );

      // ログイン成功時のみ JWT を Cookie に保存
      // middleware や Server Component から認証状態を参照するために使用する
      nextResponse.cookies.set({
        name: "access_token",
        value: data.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return nextResponse;
    }

    // -------------------------------------------------------------
    // 失敗扱い（token欠損・APIエラー含む）
    // 成功レスポンスの形を偽らず、必ず401に統一
    // -------------------------------------------------------------
    return NextResponse.json(
      {
        message: "ログインに失敗しました",
      },
      {
        status: 401,
      },
    );
  } catch (error) {
    console.error("ログインAPIエラー:", error);

    return NextResponse.json(
      {
        message: String(error),
      },
      {
        status: 500,
      },
    );
  }
}
