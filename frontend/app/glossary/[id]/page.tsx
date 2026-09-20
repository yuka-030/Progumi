// Progumi/frontend/app/glossary/[id]/page.tsx
"use client";

import Badge from "@/components/common/Badge";
import Card from "@/components/common/Card";
import { Term } from "@/types/term";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GlossaryDetailPage() {
  // URLの動的パラメータ [id] を取得
  const { id } = useParams();

  // 戻るボタン用のクエリパラメータを取得
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  // 戻るURLを生成（検索・フィルター状態を復元）
  const backParams = new URLSearchParams();
  if (search) backParams.set("search", search);
  if (category) backParams.set("category", category);
  const backUrl = `/glossary${backParams.toString() ? `?${backParams.toString()}` : ""}`;

  // 用語データ・ローディング・エラーの状態管理
  const [term, setTerm] = useState<Term | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // idが変わるたびにAPIから用語詳細を取得
  useEffect(() => {
    const fetchTerm = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/terms/${id}`,
        );

        // 用語が存在しない場合
        if (res.status === 404) {
          throw new Error("用語が見つかりませんでした。");
        }

        // その他のエラー
        if (!res.ok) {
          throw new Error("用語の取得に失敗しました。");
        }

        const data: Term = await res.json();
        setTerm(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "用語の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    // idが取得できた場合のみfetchを実行
    if (id) fetchTerm();
  }, [id]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* ローディング */}
        {isLoading && (
          <p className="text-center text-gray-400 py-10">読み込み中...</p>
        )}

        {/* エラー */}
        {!isLoading && error && (
          <p className="text-center text-red-400 py-10">{error}</p>
        )}

        {/* 用語詳細 */}
        {!isLoading && !error && term && (
          <>
            <Card>
              {/* カテゴリバッジ */}
              <div className="mb-4">
                <Badge category={term.category}>{term.category}</Badge>
              </div>

              {/* 用語名 */}
              <h1 className="text-2xl font-bold text-foreground mb-6">
                {term.term}
              </h1>

              {/* 詳細説明 */}
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  解説
                </h2>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {term.description}
                </p>
              </div>
            </Card>

            {/* 戻るボタン */}
            <div className="mt-6 flex justify-center">
              <Link
                href={backUrl}
                className="text-sm text-primary hover:underline"
              >
                ≪ 用語集一覧に戻る
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
