// Progumi/frontend/lib/api/quizResult.ts
// クイズ結果保存APIを叩く関数
// JWTはhttpOnly CookieのためRoute Handler経由で送信する
import { QuizSessionResult } from "@/lib/utils/quizSession";

export async function saveQuizResultToAPI(
  result: QuizSessionResult,
): Promise<void> {
  // sessionStorageのデータ形式をバックエンドのスキーマに変換
  const body = {
    score: result.score,
    total_questions: result.total_questions,
    questions: result.questions.map((q) => ({
      quiz_question_id: q.question_id,
      is_correct: q.is_correct,
      selected_choice: ["A", "B", "C", "D"].indexOf(q.selected_choice),
    })),
  };

  const res = await fetch("/api/quiz/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // CookieをRoute Handlerに送信
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message ?? "クイズ結果の保存に失敗しました。");
  }
}
