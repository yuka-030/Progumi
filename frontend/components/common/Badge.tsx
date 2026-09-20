// Progumi/frontend/components/common/Badge.tsx
import { getCategoryStyle } from "@/lib/utils/categoryStyle";

type CategoryStyle = ReturnType<typeof getCategoryStyle>;

type BadgeProps = {
  children: React.ReactNode;
  category?: string;
  style?: CategoryStyle; // 一覧表示時はbuildCategoryColorMapで計算した色を渡す
};

export default function Badge({ children, category = "", style }: BadgeProps) {
  // styleが渡されればそれを使い、なければカテゴリ名から決定論的に算出
  const resolvedStyle = style ?? getCategoryStyle(category);
  const baseStyle =
    "inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full";

  return (
    <span className={`${baseStyle} ${resolvedStyle.bg} ${resolvedStyle.text}`}>
      {children}
    </span>
  );
}
