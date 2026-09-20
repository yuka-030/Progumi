// Progumi/frontend/types/history.ts
export type StudiedTerm = {
  term: string;      // 用語名
  is_correct: boolean; // 正誤判定
  category: string; // カテゴリ名
};

export type HistoryEntry = {
  quizResultId: string;
  createdAt: string; // quiz_results.created_at
  totalQuestions: number; // quiz_results.total_questions
  correctAnswers: number; // quiz_results.correct_answers
  score: number; // quiz_results.score
  studiedTerms: StudiedTerm[]; // 用語名と正誤情報のセット
};
