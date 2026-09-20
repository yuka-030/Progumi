// Progumi/frontend/app/api/auth/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // access_tokenのCookieを削除（有効期限を過去にする）
  cookieStore.set("access_token", "", {
    path: "/",
    expires: new Date(0), // 過去の日時にして消去
    httpOnly: true, // サーバー側で管理
  });

  return NextResponse.json({ success: true });
}
