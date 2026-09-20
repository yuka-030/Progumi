// Progumi/frontend/app/admin/terms/page.tsx
"use client";

import { DeleteConfirmModal } from "@/components/admin-terms/DeleteConfirmModal";
import { TermsFilter } from "@/components/admin-terms/TermsFilter";
import { TermsTable } from "@/components/admin-terms/TermsTable";
import { Term, deleteTerm, getTerms } from "@/lib/api/terms";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function AdminTermsListPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル管理用のステート
  const [isModalOpen, setIsModalOpen] = useState(false);
  // idとtermだけでなく、Term型オブジェクトを丸ごと保持 ✨
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  // 📋 用語一覧をAPIから取得
  const fetchTerms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTerms();
      // 用語名順で固定（編集しても表示順が変わらない）
      const sorted = [...data].sort((a, b) =>
        a.term.localeCompare(b.term, "ja"),
      );
      setTerms(sorted);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("用語一覧の取得に失敗しました。");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回マウント時に用語一覧を取得
  useEffect(() => {
    let isMounted = true;

    const fetchTerms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTerms();
        // 用語名順で固定（編集しても表示順が変わらない）
        const sorted = [...data].sort((a, b) =>
          a.term.localeCompare(b.term, "ja"),
        );
        if (isMounted) setTerms(sorted);
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("用語一覧の取得に失敗しました。");
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTerms();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🏷️ 初回マウント時にカテゴリ一覧をDBから取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/terms/categories`,
        );
        if (!res.ok) return;
        const data: string[] = await res.json();
        setCategories(data);
      } catch {
        // 取得失敗時は空のまま（「すべてのカテゴリ」のみ表示）
      }
    };
    fetchCategories();
  }, []);

  // 🗑️ テーブルの削除がクリックされた時、モーダルを開く
  // 引数でtermのIDやタイトルをバラバラに受けるのではなく、オブジェクトごと受け取る
  const openDeleteModal = (term: Term) => {
    setSelectedTerm(term);
    setIsModalOpen(true);
  };

  // 🔥 モーダル側で「削除する」が確定された時の処理（完全復元版）
  const handleExecuteDelete = async () => {
    if (!selectedTerm) return;

    // 1. 削除対象の「元の実データ」を丸ごとローカル変数に固定（これで完全な復元を担保）
    const targetTerm = { ...selectedTerm };
    const targetId = targetTerm.id;

    try {
      // 2. 【楽観的アップデート】関数型アップデートで安全に先消し
      setTerms((prevTerms) => prevTerms.filter((term) => term.id !== targetId));

      // モーダルは即座に閉じる
      setIsModalOpen(false);
      setSelectedTerm(null);

      // 3. 【実データ更新】lib/api/terms.ts の deleteTerm を使って削除
      await deleteTerm(targetId);

      // 4. 削除成功後にDBから最新データを再取得
      await fetchTerms();
    } catch (error) {
      console.error(
        "削除処理に失敗したため、対象アイテムのみを復元します:",
        error,
      );
      alert("通信エラーが発生したため、用語の削除に失敗しました。");

      // 5. 【完全なロールバック】✨
      setTerms((currentTerms) => {
        const exists = currentTerms.some((term) => term.id === targetId);
        if (exists) return currentTerms;
        return [...currentTerms, targetTerm];
      });
    }
  };

  // 🔍 検索＆フィルタリングロジック
  const filteredTerms = terms.filter((term) => {
    const matchesSearch = term.term
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      {/* 1. パンくず＆上部ヘッダー */}
      <div className="mb-6">
        <div className="text-xs text-gray-400 mb-10">
          <Link href="/admin" className="hover:underline">
            管理者ダッシュボード
          </Link>{" "}
          &gt; <span className="text-gray-600">用語管理一覧</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-4">用語管理一覧</h1>
            <p className="text-sm text-gray-500 mt-1">
              登録されているプログラミング用語の編集・管理
            </p>
          </div>
          <Link href="/admin/terms/new">
            <button className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-3 rounded-[20px] shadow-sm shadow-primary/20 transition-colors text-sm">
              ＋ 新規用語を追加
            </button>
          </Link>
        </div>
      </div>

      {/* ローディング */}
      {isLoading && (
        <p className="text-center text-gray-400 py-10">読み込み中...</p>
      )}

      {/* エラー */}
      {!isLoading && error && (
        <p className="text-center text-red-400 py-10">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          {/* 2. 検索・フィルタリングエリア */}
          <TermsFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />

          {/* 3. 用語管理テーブル */}
          <TermsTable
            terms={filteredTerms}
            onDeleteClick={(id, term) => {
              const foundTerm = terms.find((t) => t.id === id);
              if (foundTerm) openDeleteModal(foundTerm);
            }}
          />
        </>
      )}

      {/* 4. カスタム削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={isModalOpen}
        termTitle={selectedTerm?.term || ""}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTerm(null);
        }}
        onConfirm={handleExecuteDelete}
      />
    </div>
  );
}
