// Progumi/frontend/app/quiz/play/page.tsx
"use client";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import ChoiceButton from "@/components/quiz/ChoiceButton";
import ProgressBar from "@/components/quiz/ProgressBar";
import { QuizQuestion } from "@/lib/api/quiz";
import { QuizQuestionResult, saveQuizResult } from "@/lib/utils/quizSession";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuizPlayPage() {
  const router = useRouter();

  // sessionStorageからクイズデータを取得（初回レンダリング時のみ）
  // SSR時はwindowが存在しないため、undefinedチェックを行う
  const [questions] = useState<QuizQuestion[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = sessionStorage.getItem("quizQuestions");
    if (!stored) return [];
    try {
      return JSON.parse(stored) as QuizQuestion[];
    } catch {
      // データが壊れている・不正な形式の場合は安全に空配列を返す
      console.error("クイズデータのパースに失敗しました");
      return [];
    }
  });

  // 現在の問題インデックス
  const [currentIndex, setCurrentIndex] = useState(0);

  // 選択中の選択肢番号（1〜4）
  const [selected, setSelected] = useState<number | null>(null);

  // 正解数トラッキング
  const [correctCount, setCorrectCount] = useState(0);

  // 各問題の結果を蓄積
  const [questionResults, setQuestionResults] = useState<QuizQuestionResult[]>(
    [],
  );

  // questionsが空の間はnullを返す
  if (questions.length === 0) {
    router.push("/quiz");
    return null;
  }
  const currentQuestion = questions[currentIndex];
  const isAnswered = selected !== null;
  const isLastQuestion = currentIndex === questions.length - 1;

  // 選択肢データを表示用に変換（ラベル・テキスト・番号）
  const choices = currentQuestion.options.map((text, index) => ({
    label: ["A", "B", "C", "D"][index],
    text: text,
    value: index,
  }));

  // 選択時に正誤を即時記録
  const handleSelect = (value: number) => {
    if (isAnswered) return; // 二重選択防止
    const isCorrect = value === currentQuestion.correct_answer_index;
    setSelected(value);

    // 最終問題はhandleNextで追加するためここではスキップ
    if (!isLastQuestion) {
      setCorrectCount((prev) => (isCorrect ? prev + 1 : prev));
      setQuestionResults((prev) => [
        ...prev,
        {
          question_id: currentQuestion.id ?? "", // undefined対策
          selected_choice: choices[value].label,
          is_correct: isCorrect,
        },
      ]);
    }
  };

  // 次の問題へ進む、または最終問題のとき saveQuizResult() してから遷移
  const handleNext = () => {
    if (isLastQuestion) {
      // stateは非同期更新のため、即値から最終問題の結果を組み立て直す
      const isCorrect = selected === currentQuestion.correct_answer_index;

      // 最終問題の結果エントリを即値で生成
      const finalResult: QuizQuestionResult = {
        question_id: currentQuestion.id ?? "",
        selected_choice: choices.find((c) => c.value === selected)?.label ?? "",
        is_correct: isCorrect,
      };

      // これまでの結果に最終問題分を追加
      const finalResults = [...questionResults, finalResult];

      // 正解数も即値で加算
      const finalCorrectCount = correctCount + (isCorrect ? 1 : 0);

      // questionResults はすでに handleSelect で更新済みなので、そのまま使う
      saveQuizResult({
        total_questions: questions.length,
        correct_answers: finalCorrectCount,
        score: Math.round((finalCorrectCount / questions.length) * 100),
        questions: finalResults,
      });
      router.push("/quiz/result");
      return;
    }

    // 最終問題でない場合は次の問題へ進む
    setCurrentIndex((prev) => prev + 1);
    setSelected(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
      {/* 進捗バー */}
      <div className="bg-primary rounded-2xl p-4">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      {/* 問題カード */}
      <Card className="space-y-4">
        {/* 問題文 */}
        <h1 className="text-base font-bold text-foreground leading-relaxed">
          {currentQuestion.question}
        </h1>

        {/* 選択肢ボタン */}
        <div className="space-y-2">
          {choices.map((choice) => (
            <ChoiceButton
              key={choice.label}
              label={choice.label}
              text={choice.text}
              isSelected={selected === choice.value}
              isCorrect={choice.value === currentQuestion.correct_answer_index}
              isAnswered={isAnswered}
              onSelect={() => handleSelect(choice.value)}
            />
          ))}
        </div>

        {/* 回答後の正解表示 */}
        {isAnswered && (
          <div className="bg-green-50 border border-green-400 rounded-2xl p-4">
            <p className="text-sm font-bold text-green-700">
              正解：
              {
                choices.find(
                  (c) => c.value === currentQuestion.correct_answer_index,
                )?.label
              }
            </p>
          </div>
        )}
      </Card>

      {/* 次の問題への遷移ボタン（回答後のみ表示） */}
      {isAnswered && (
        <div className="flex justify-end">
          <Button variant="primary" size="lg" onClick={handleNext}>
            {isLastQuestion ? "結果を見る" : "次の問題へ"}
          </Button>
        </div>
      )}
    </div>
  );
}
