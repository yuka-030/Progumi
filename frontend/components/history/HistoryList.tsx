// Progumi/frontend/components/history/HistoryList.tsx
import HistoryItem from "@/components/history/HistoryItem";
import { HistoryEntry } from "@/types/history";

type Props = {
  entries: HistoryEntry[];
};

export default function HistoryList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        学習履歴がありません
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <HistoryItem key={entry.quizResultId} entry={entry} />
      ))}
    </div>
  );
}
