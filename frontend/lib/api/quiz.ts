// Progumi/frontend/lib/api/quiz.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type QuizQuestion = {
  id?: string;
  question: string;
  options: string[];
  correct_answer_index: number;
};

export type QuizGenerateResponse = {
  questions: QuizQuestion[];
};

export async function generateQuiz(
  category: string,
): Promise<QuizGenerateResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URLが設定されていません。");
  }

  const res = await fetch(
    `${API_BASE_URL}/api/quiz/generate?category=${encodeURIComponent(category)}`,
    { method: "POST" },
  );

  // 429のときは専用エラーを投げる
  if (res.status === 429) {
    throw new Error(
      "AIのリクエスト制限に達しました。しばらく待ってから再試行してください。",
    );
  }

  if (!res.ok) {
    throw new Error("クイズの生成に失敗しました。");
  }

  return res.json();
}
