"use client";

type ChoiceButtonProps = {
  label: string;            // "A", "B", "C", "D"
  text: string;             // 選択肢の本文
  isSelected: boolean;      // この選択肢がユーザーに選ばれたか
  isCorrect: boolean;       // この選択肢が正解かどうか
  isAnswered: boolean;      // クイズ全体が回答済みかどうか
  onSelect: () => void;     // クリック時の処理
};

export default function ChoiceButton({
  label,
  text,
  isSelected,
  isCorrect,
  isAnswered,
  onSelect,
}: ChoiceButtonProps) {
  const baseStyle =
    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm text-left transition";

  let styleClass = "bg-background border-pink-100 text-foreground";

  if (isAnswered) {
    if (isCorrect) {
      // 正解の選択肢は常に緑で表示
      styleClass = "bg-green-50 border-green-400 text-green-700";
    } else if (isSelected) {
      // 選んだが不正解だった選択肢は赤
      styleClass = "bg-red-50 border-red-400 text-red-700";
    } else {
      // 回答済みで、正解でも選択でもない選択肢
      styleClass = "bg-background border-pink-100 text-gray-400";
    }
  }

  return (
    <button
      onClick={onSelect}
      disabled={isAnswered}
      className={`${baseStyle} ${styleClass} ${
        isAnswered ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
        {label}
      </span>
      <span>{text}</span>
    </button>
  );
}