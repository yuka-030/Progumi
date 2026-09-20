// Progumi/frontend/lib/utils/quizSession.ts
const SESSION_KEY = "progumi_quiz_result";

export type QuizQuestionResult = {
  question_id: string;
  selected_choice: string;
  is_correct: boolean;
};

export type QuizSessionResult = {
  total_questions: number;
  correct_answers: number;
  score: number;
  questions: QuizQuestionResult[]; //各問題の結果を配列で保持
};

//sessionStorageには文字列しか保存できないためJSON.stringify でオブジェクトを文字列に変換して保存
export function saveQuizResult(result: QuizSessionResult) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
}

//保存した文字列を JSON.parse でオブジェクトに戻して取得する
//データが壊れている場合はnullを返す
export function getQuizResult(): QuizSessionResult | null {
  const data = sessionStorage.getItem(SESSION_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as QuizSessionResult;
  } catch {
    // データが壊れている・不正な形式の場合は安全にnullを返す
    console.error("クイズ結果データのパースに失敗しました");
    return null;
  }
}

//会員登録完了後、DBへの保存が終わったら不要になったセッションデータを削除する（登録画面担当が使う関数）
export function clearQuizResult() {
  sessionStorage.removeItem(SESSION_KEY);
}
