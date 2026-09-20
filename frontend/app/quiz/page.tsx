// Progumi/frontend/app/quiz/page.tsx
"use client";

import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { generateQuiz } from "@/lib/api/quiz";
import { buildCategoryColorMap } from "@/lib/utils/categoryStyle";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 残り挑戦回数の型
type RemainingInfo = {
  remaining: number;
  limit: number;
  is_member: boolean;
};

export default function QuizPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // 残り挑戦回数
  const [remainingInfo, setRemainingInfo] = useState<RemainingInfo | null>(
    null,
  );

  // 用語集と同じロジックで色マップを生成（並び順に基づき隣接衝突を回避）
  const colorMap = buildCategoryColorMap(categories);

  // カテゴリー一覧をAPIから取得（初回のみ）
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
      } catch {
        setCategoriesError("カテゴリーの取得に失敗しました。");
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 残り挑戦回数をRoute Handler経由で取得（初回のみ）
  useEffect(() => {
    const fetchRemaining = async () => {
      try {
        const res = await fetch("/api/quiz/remaining");
        if (!res.ok) return;
        const data: RemainingInfo = await res.json();
        setRemainingInfo(data);
      } catch {
        // 取得失敗時は表示しない
      }
    };

    fetchRemaining();
  }, []);

  // クイズ開始の処理
  const handleStart = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);
    setError(null);

    try {
      // lib/api/quiz.ts の generateQuiz を使ってAPIを呼び出す
      const data = await generateQuiz(selectedCategory);

      // 取得したクイズデータをsessionStorageに保存してクイズ画面へ遷移
      sessionStorage.setItem("quizQuestions", JSON.stringify(data.questions));
      router.push("/quiz/play");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("クイズの開始に失敗しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
      {/* 説明文 */}
      <Card className="text-center space-y-2">
        <h1 className="text-xl font-bold text-foreground">
          クイズに挑戦しよう
        </h1>
        <p className="text-sm text-gray-400">
          AIが生成した4択クイズで、知識の定着度を確認しよう。
          <br />
          カテゴリを選んで「クイズを始める」をタップしてください。
        </p>

        {/* 挑戦回数の表示 */}
        {remainingInfo && (
          <p className="text-xs text-gray-400 pt-2">
            挑戦できる回数：
            <span
              className={`font-bold ${
                remainingInfo.remaining === 0 ? "text-red-400" : "text-primary"
              }`}
            >
              {remainingInfo.remaining} / {remainingInfo.limit}回
            </span>
            {!remainingInfo.is_member && "（ゲスト）"}
          </p>
        )}
      </Card>

      {/* カテゴリ選択 */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-foreground">カテゴリを選択</p>
        {isCategoriesLoading ? (
          <p className="text-sm text-gray-400">カテゴリー読み込み中...</p>
        ) : categoriesError ? (
          <p className="text-sm text-red-400">{categoriesError}</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
              >
                <Badge category={category} style={colorMap.get(category)}>
                  {category}
                  {selectedCategory === category && " ✓"}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && <p className="text-center text-red-400 text-sm">{error}</p>}

      {/* 開始ボタン */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleStart}
          disabled={
            !selectedCategory ||
            isLoading ||
            isCategoriesLoading ||
            remainingInfo?.remaining === 0
          }
        >
          {isLoading ? "クイズを生成中..." : "クイズを始める"}
        </Button>
      </div>
    </div>
  );
}
