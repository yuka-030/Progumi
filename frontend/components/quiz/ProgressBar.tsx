type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const rawPercentage = total > 0 ? (current / total) * 100 : 0;
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-white/80">
        <span>
          {current} / {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-card/20 rounded-full h-1.5">
        <div
          className="bg-card rounded-full h-1.5 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
