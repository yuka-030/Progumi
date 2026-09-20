// Progumi/frontend/components/glossary/TermItem.tsx
import Badge from "@/components/common/Badge";
import { getCategoryStyle } from "@/lib/utils/categoryStyle";
import { Term } from "@/types/term";
import Link from "next/link";

type CategoryStyle = ReturnType<typeof getCategoryStyle>;

type Props = {
  term: Term;
  index: number;
  searchValue?: string;
  selectedCategory?: string;
  categoryStyle?: CategoryStyle;
};

export default function TermItem({
  term,
  searchValue = "",
  selectedCategory = "",
  categoryStyle,
}: Props) {
  // 戻ったときの状態復元用クエリパラメータを生成
  const params = new URLSearchParams();
  if (searchValue) params.set("search", searchValue);
  if (selectedCategory) params.set("category", selectedCategory);
  const query = params.toString();

  return (
    <Link href={`/glossary/${term.id}${query ? `?${query}` : ""}`}>
      <div className="flex items-start justify-between py-4 px-2 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
        {/* 左：ドット・用語名 */}
        <div className="flex items-start gap-3 min-w-0">
          {/* ドット */}
          <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />

          {/* 用語名 */}
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{term.term}</p>
          </div>
        </div>

        {/* 右：カテゴリバッジ（表示順インデックスで色を分散） */}
        <div className="ml-4 shrink-0">
          <Badge category={term.category} style={categoryStyle}>
            {term.category}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
