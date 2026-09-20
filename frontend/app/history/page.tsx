// Progumi/frontend/app/history/page.tsx
"use client";

import HistoryList from "@/components/history/HistoryList";
import { getHistory } from "@/lib/api/history";
import { HistoryEntry } from "@/types/history";
import Link from "next/link";
import { useEffect, useState } from "react";

type Status =
  | { type: "loading" }
  | { type: "unauthenticated" }
  | { type: "error"; message: string }
  | { type: "success"; entries: HistoryEntry[] };

export default function HistoryPage() {
  const [status, setStatus] = useState<Status>({ type: "loading" });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // JWT は Route Handler 側で取得するため、
        // クライアント側ではトークンを扱わない
        const data = await getHistory();
        setStatus({ type: "success", entries: data });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "学習履歴の取得に失敗しました";
        setStatus({ type: "error", message });
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-bold text-foreground">学習履歴</h1>

      {status.type === "loading" && (
        <p className="text-sm text-gray-400 text-center py-8">読み込み中...</p>
      )}

      {status.type === "unauthenticated" && (
        <div className="text-sm text-gray-500 text-center py-8 space-y-2">
          <p>学習履歴を見るにはログインが必要です</p>
          <Link href="/login" className="text-primary underline">
            ログイン画面へ
          </Link>
        </div>
      )}

      {status.type === "error" && (
        <p className="text-sm text-red-500 text-center py-8">
          {status.message}
        </p>
      )}

      {status.type === "success" && <HistoryList entries={status.entries} />}
    </div>
  );
}
