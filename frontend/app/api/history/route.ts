// Progumi/frontend/app/api/history/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.INTERNAL_API_URL;

// JSONパース失敗時にnullを返すユーティリティ
// バックエンドが非JSONレスポンスを返した場合の安全な処理
const parseJSON = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

// 学習履歴取得API
// httpOnly Cookie に保存された JWT を取得し、FastAPIへ Bearer認証として転送する
export async function GET() {
  try {
    // -------------------------------------------------------------
    // 設定値チェック（未設定を即検知）
    // -------------------------------------------------------------
    if (!API_BASE_URL) {
      console.error("INTERNAL_API_URL が未設定です");

      return NextResponse.json(
        {
          message: "サーバー設定エラー（API URL未設定）",
        },
        {
          status: 500,
        },
      );
    }

    // サーバー側で access_token を取得
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    // JWTが存在しない場合は未認証
    if (!token) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    // FastAPIの履歴取得APIへ転送
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      headers: {
        // JWTを Bearerトークンとして付与
        Authorization: `Bearer ${token}`,
      },
    });

    // バックエンドが非JSONレスポンスを返した場合は500で安全に返す
    const data = await parseJSON(response);

    if (!data) {
      return NextResponse.json(
        { message: "バックエンドから不正なレスポンスが返されました" },
        { status: 500 },
      );
    }

    // バックエンドのレスポンスをそのまま返却
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}
