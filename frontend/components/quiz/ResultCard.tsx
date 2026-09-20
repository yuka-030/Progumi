// Progumi/frontend/components/quiz/ResultCard.tsx
import Card from "@/components/common/Card";

type QuestionResult = {
  questionNumber: number;
  isCorrect: boolean;
};

type ResultCardProps = {
  correctCount: number; //正答数（例：3）
  totalCount: number; //全問数（例：5）
  results: QuestionResult[]; //→ 各問題の結果の配列
};

// スコアに応じたGeminiっぽいメッセージを返す
function getResultMessage(correct: number, total: number): string {
  const ratio = correct / total;
  if (correct === total)
    return `${total}/${total}問全問正解✨ おめでとう🎉 完璧だよ！`;
  if (ratio >= 0.8)
    return `${correct}/${total}問正解🎊 あともう少しで満点！すごいよ👏🏻`;
  if (ratio >= 0.6)
    return `${correct}/${total}問正解👏🏻 頑張ったね！次はもっといけるよ😊`;
  if (ratio >= 0.4) return `${correct}/${total}問正解💦 惜しい！もう一息だよ☺️`;
  return `${correct}/${total}問正解🌱 ドンマイ！一緒に復習してみよう💪`;
}

export default function ResultCard({
  correctCount,
  totalCount,
  results,
}: ResultCardProps) {
  return (
    <Card className="space-y-6">
      {/* スコア表示 */}
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-1">あなたのスコア</p>
        <p className="text-3xl font-bold text-primary">
          {correctCount}{" "}
          <span className="text-lg text-gray-400">/ {totalCount}</span>
        </p>
        {/* メッセージ */}
        <p className="text-sm font-bold text-foreground">
          {getResultMessage(correctCount, totalCount)}
        </p>
      </div>

      {/* 問題ごとの結果 */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-foreground">問題別の結果</p>
        <div className="flex gap-2 flex-wrap">
          {results.map((result) => (
            <div
              key={result.questionNumber}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold ${
                result.isCorrect
                  ? "bg-green-50 text-green-600 border border-green-400"
                  : "bg-red-50 text-red-600 border border-red-400"
              }`}
            >
              {result.questionNumber}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
