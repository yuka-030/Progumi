// Progumi/frontend/components/glossary/TagFilter.tsx
import { buildCategoryColorMap } from "@/lib/utils/categoryStyle";

export const ALL_CATEGORY = "all" as const;

type Props = {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
};

export default function TagFilter({ categories, selected, onSelect }: Props) {
  // 表示順（categoriesの並び順）に基づいて、隣接して同じ色にならないよう色を割り当てる
  const colorMap = buildCategoryColorMap(categories);

  return (
    <div className="flex flex-wrap gap-2">
      {/* 「All」タグ */}
      <button
        type="button"
        onClick={() => onSelect(ALL_CATEGORY)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === ALL_CATEGORY
            ? "bg-primary/80 text-white"
            : "bg-card text-gray-500 border border-gray-200 hover:border-primary hover:text-primary"
        }`}
      >
        All
      </button>

      {/* カテゴリタグ */}
      {categories.map((category) => {
        const style = colorMap.get(category)!;
        const isSelected = selected === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isSelected
                ? `${style.activeBg} ${style.activeText}`
                : "bg-card text-gray-500 border border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
