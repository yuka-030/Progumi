// Progumi/frontend/app/components/quiz/QuizResultClient.tsx
// クライアントコンポーネント：sessionStorageからクイズ結果を読み取り表示する
// ログイン状態はServer Component（page.tsx）からpropsで受け取る
"use client";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import ResultCard from "@/components/quiz/ResultCard";
import { saveQuizResultToAPI } from "@/lib/api/quizResult";
import { getQuizResult, type QuizSessionResult } from "@/lib/utils/quizSession";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  isLoggedIn: boolean;
};

export default function QuizResultClient({ isLoggedIn }: Props) {
  // sessionStorageはブラウザ専用のため、useState初期化関数内で読み取る
  const [result] = useState<QuizSessionResult | null>(() => getQuizResult());

  // APIへの保存状態管理
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isSavedRef = useRef(false);

  useEffect(() => {
    // ログイン済みかつ結果がある場合のみAPIに保存する
    if (!isLoggedIn || !result || isSavedRef.current) return;
    isSavedRef.current = true; // 同期的にフラグを立てる

    const save = async () => {
      setIsSaving(true);
      setSaveError(null);
      try {
        await saveQuizResultToAPI(result);
      } catch (err) {
        setSaveError(
          err instanceof Error
            ? err.message
            : "クイズ結果の保存に失敗しました。",
        );
      } finally {
        setIsSaving(false);
      }
    };

    save();
    // resultとisLoggedInは初回のみ実行すれば十分なため依存配列に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 結果データが見つからない場合の表示（クイズを経由せず直接アクセスした場合など）
  if (!result) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
        <Card className="text-center space-y-3">
          <p className="text-sm font-bold text-foreground">
            クイズの結果が見つかりませんでした
          </p>
          <p className="text-xs text-gray-400">
            クイズに挑戦すると、ここに結果が表示されます。
          </p>
          <Link href="/quiz">
            <Button variant="primary">クイズに挑戦する</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // 各問題の正誤を表示用データに変換
  const results = result.questions.map((question, index) => ({
    questionNumber: index + 1,
    isCorrect: question.is_correct,
  }));

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
      {/* スコア・振り返りカード */}
      <ResultCard
        correctCount={result.correct_answers}
        totalCount={result.total_questions}
        results={results}
      />

      {/* 保存中・保存エラーの表示 */}
      {isSaving && (
        <p className="text-center text-sm text-gray-400">結果を保存中...</p>
      )}
      {saveError && (
        <p className="text-center text-sm text-red-400">{saveError}</p>
      )}

      {/* 未ログイン時のみ会員登録導線を表示 */}
      {!isLoggedIn && (
        <Card className="text-center space-y-2">
          <p className="text-sm font-bold text-foreground">
            登録すると結果を保存できます
          </p>
          <p className="text-xs text-gray-400">
            無料登録で学習履歴を記録して、成長を振り返ろう
          </p>
          <Link href="/register">
            <Button variant="primary">会員登録する</Button>
          </Link>
        </Card>
      )}

      {/* 各種ナビゲーションボタン */}
      <div className="flex flex-col gap-3 items-center">
        <Link href="/quiz">
          <Button variant="primary" size="lg">
            もう一度挑戦する
          </Button>
        </Link>
        <Link href="/glossary">
          <Button variant="ghost" size="lg">
            用語集に戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
