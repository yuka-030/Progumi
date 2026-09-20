// Progumi/frontend/app/glossary/page.tsx
"use client";

import Card from "@/components/common/Card";
import SearchBox from "@/components/glossary/SearchBox";
import TagFilter, { ALL_CATEGORY } from "@/components/glossary/TagFilter";
import TermItem from "@/components/glossary/TermItem";
import { buildCategoryColorMap } from "@/lib/utils/categoryStyle";
import { Term } from "@/types/term";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GlossaryPage() {
  // 詳細画面から戻った際の状態復元用クエリパラメータを取得
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? "",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") ?? ALL_CATEGORY,
  );
  const [terms, setTerms] = useState<Term[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryColorMap = buildCategoryColorMap(terms.map((t) => t.category));

  // カテゴリー一覧を取得(初回のみ)
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/terms/categories`,
        );

        if (!res.ok) {
          throw new Error("カテゴリー一覧の取得に失敗しました。");
        }
        const data: string[] = await res.json();
        setCategories(data);
        setCategoriesError(null);
      } catch (e) {
        setCategories([]);
        setCategoriesError(
          "カテゴリーフィルターの取得に失敗しました。「All」のみ利用できます。",
        );
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 用語一覧を取得(検索・カテゴリー変更時)
  useEffect(() => {
    const fetchTerms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        // 検索語をクエリに追加
        if (searchValue) {
          params.append("search", searchValue);
        }
        if (selectedCategory !== ALL_CATEGORY) {
          params.append("category", selectedCategory);
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/terms?${params.toString()}`,
        );

        if (!res.ok) {
          throw new Error("用語一覧の取得に失敗しました。");
        }

        const data: Term[] = await res.json();
        // 用語名の五十音順で固定表示
        const sorted = [...data].sort((a, b) =>
          a.term.localeCompare(b.term, "ja"),
        );
        setTerms(sorted);
      } catch (e) {
        setError("データの取得に失敗しました。再度お試しください。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [searchValue, selectedCategory]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Card>
          {/* 検索ボックス */}
          <div className="mb-6">
            <SearchBox
              onSearch={setSearchValue}
              placeholder="Search..."
              // 戻った際に検索キーワードを復元
              initialValue={searchValue}
            />
          </div>

          {/* タグフィルター */}
          <div className="mb-6">
            {categoriesError && (
              <p className="text-sm text-red-400 mb-2">{categoriesError}</p>
            )}
            {isCategoriesLoading ? (
              <p className="text-sm text-gray-400">カテゴリー読み込み中...</p>
            ) : (
              <TagFilter
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}
          </div>

          {/* ローディング */}
          {isLoading && (
            <p className="text-center text-gray-400 py-10">読み込み中...</p>
          )}

          {/* エラー */}
          {!isLoading && error && (
            <p className="text-center text-red-400 py-10">{error}</p>
          )}

          {/* 用語一覧 */}
          {!isLoading &&
            !error &&
            terms.map((term, index) => (
              <TermItem
                key={term.id}
                term={term}
                index={index}
                searchValue={searchValue}
                selectedCategory={selectedCategory}
                categoryStyle={categoryColorMap.get(term.category)}
              />
            ))}

          {/* 検索結果なし */}
          {!isLoading && !error && terms.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              該当する用語が見つかりませんでした。
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
