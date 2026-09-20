// Progumi/frontend/lib/api/history.ts
import { HistoryEntry } from "@/types/history";

// 学習履歴取得APIは Next.js の Route Handler を経由する。
// JWT は httpOnly Cookie に保存されているため、クライアント側から直接参照しない。
export async function getHistory(): Promise<HistoryEntry[]> {
  const res = await fetch("/api/history", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("学習履歴の取得に失敗しました");
  }

  return res.json();
}
