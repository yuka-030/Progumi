// Progumi/frontend/components/history/HistoryItem.tsx
import Card from "@/components/common/Card";
import TermTagList from "@/components/history/TermTagList";
import { HistoryEntry } from "@/types/history";

type Props = {
  entry: HistoryEntry;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function HistoryItem({ entry }: Props) {
  const accuracy =
    entry.totalQuestions > 0
      ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100)
      : 0;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{formatDate(entry.createdAt)}</p>
        <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
          正答率 {accuracy}%
        </span>
      </div>

      <p className="text-sm text-foreground">
        {entry.correctAnswers} / {entry.totalQuestions} 問正解（得点:{" "}
        {entry.score}点）
      </p>

      <div>
        <p className="text-xs text-gray-400 mb-1">学習した用語</p>
        <TermTagList terms={entry.studiedTerms} />
      </div>
    </Card>
  );
}
