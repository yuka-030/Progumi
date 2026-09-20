// Progumi/frontend/components/top/ActivityFeed.tsx
"use client";

import Badge from "@/components/common/Badge";
import Card from "@/components/common/Card";
import { getHistory } from "@/lib/api/history";
import { HistoryEntry } from "@/types/history";
import Link from "next/link";
import { useEffect, useState } from "react";

type ActivityFeedProps = {
  isLoggedIn: boolean;
};

// 日付をローカル時刻でYYYY-MM-DD形式に変換する（UTCずれ対策）
function toLocalDateStr(dateStr: string): string {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 全履歴の日付から連続日数を計算する
function calcStreakDays(entries: HistoryEntry[]): number {
  if (entries.length === 0) return 0;

  // ローカル日付のユニークな日付セットを作成（UTCずれ対策）
  const dateSet = new Set(entries.map((e) => toLocalDateStr(e.createdAt)));

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = toLocalDateStr(d.toISOString());
    if (dateSet.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// 連続日数のメッセージを生成する
function buildStreakMessage(
  correct: number,
  total: number,
  streak: number,
): string {
  if (streak >= 2) {
    return `${correct}/${total}問正解！連続${streak}日達成`;
  }
  return `${correct}/${total}問正解！1回達成`;
}

export default function ActivityFeed({ isLoggedIn }: ActivityFeedProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      try {
        const data = await getHistory();
        // createdAtの降順にソートして最新が先頭になるよう保証
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setEntries(sorted);
      } catch {
        // 取得失敗時は何も表示しない
      }
    };

    fetchData();
  }, [isLoggedIn]);

  if (!isLoggedIn || entries.length === 0) return null;

  // 最新の履歴1件（降順ソート済みなので先頭が最新）
  const latest = entries[0];
  const streakDays = calcStreakDays(entries);

  // 最新1回分のpt
  const latestPt = latest.correctAnswers * 10;

  // 累計pt（全履歴の正解数合計 × 10）
  const totalPt = entries.reduce((sum, e) => sum + e.correctAnswers, 0) * 10;

  // カテゴリー名をユニークで取得（重複を除去）
  const categoryNames = [
    ...new Set(latest.studiedTerms.slice(0, 3).map((t) => t.category)),
  ];

  const items = [
    {
      id: 1,
      message: `${categoryNames.join("・")}を学習しました`,
      meta: `${latest.studiedTerms[0]?.category ?? "クイズ"} · ${new Date(latest.createdAt).toLocaleDateString("ja-JP")}`,
      point: `合計 ${totalPt}pt`,
      icon: "📘",
    },
    {
      id: 2,
      message: buildStreakMessage(
        latest.correctAnswers,
        latest.totalQuestions,
        streakDays,
      ),
      meta: `Quiz · ${new Date(latest.createdAt).toLocaleDateString("ja-JP")}`,
      point: `+${latestPt}pt`,
      icon: "🏆",
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          className="text-base font-bold text-foreground"
          style={{ fontFamily: "var(--font-zen-maru)" }}
        >
          最近の学習
        </h2>
        <Link href="/history" className="text-xs font-semibold text-primary">
          すべて見る →
        </Link>
      </div>
      {items.map((item) => (
        <Card
          key={item.id}
          className="flex items-center gap-3 relative overflow-hidden"
        >
          {/* 右下の丸いアクセント */}
          <div className="absolute -bottom-3.5 -right-3.5 w-12 h-12 rounded-full bg-primary/10 shrink-0" />

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-lg shrink-0">
            {item.icon ?? "📘"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {item.message}
            </p>
            <p className="text-xs text-gray-400 mt-1">{item.meta}</p>
          </div>
          {item.point && <Badge category="programming">{item.point}</Badge>}
        </Card>
      ))}
    </section>
  );
}
