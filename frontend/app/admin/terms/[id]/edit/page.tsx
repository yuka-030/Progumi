// Progumi/frontend/app/admin/terms/[id]/edit/page.tsx
"use client";

import { TermForm } from "@/components/admin-terms/TermForm";
import type { Term } from "@/lib/api/terms";
import { getTerm } from "@/lib/api/terms";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminTermEditPage() {
  const params = useParams();
  const id = params.id as string; // URLパラメータから用語IDを取得

  const [term, setTerm] = useState<Term | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // URLのIDと一致するデータを検索
    const fetchTerm = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTerm(id);
        if (isMounted) setTerm(data);
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("用語の所得に失敗しました。");
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTerm();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      {/* パンくず＆ヘッダーナビゲーション */}
      <div className="mb-6">
        <div className="text-xs text-gray-400 mb-10">
          <Link href="/admin" className="hover:underline">
            管理者ダッシュボード
          </Link>{" "}
          &gt;{" "}
          <Link href="/admin/terms" className="hover:underline">
            用語管理一覧
          </Link>{" "}
          &gt; <span className="text-gray-600">用語の編集</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground mb-4">
            用語の編集
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading
              ? "データを読み込んでいます..."
              : `「${term?.term}」の情報を更新します`}
          </p>
        </div>
      </div>

      {/* フォーム入力エリア（設計書：カード背景 #FFFFFF、角丸大きめ 24px） */}
      <div className="bg-card rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 max-w-2xl">
        {/* ローディング */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm font-medium">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            編集データを取得中...
          </div>
        )}

        {/* エラー */}
        {!isLoading && error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Link
              href="/admin/terms"
              className="text-primary hover:underline text-sm"
            >
              用語管理一覧に戻る
            </Link>
          </div>
        )}

        {/* フォーム */}
        {!isLoading && !error && term && (
          <TermForm
            termId={id}
            initialValues={{
              category: term.category,
              term: term.term,
              description: term.description,
            }}
            isEditMode={true}
          />
        )}
      </div>
    </div>
  );
}
