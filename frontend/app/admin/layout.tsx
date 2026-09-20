// Progumi/frontend/app/admin/layout.tsx
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type JWTPayload = {
  role?: string;
};

async function getAdminUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  // JWT検証用の秘密鍵を取得
  const jwtSecret = process.env.SECRET_KEY;

  // 環境変数の設定漏れを検知
  if (!jwtSecret) {
    throw new Error("SECRET_KEY is not defined");
  }
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch {
    // トークン不正・期限切れなどは未認証扱い
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  // 未認証 or adminロール以外はログインへ
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-base-bg)] text-[var(--color-text)]">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
