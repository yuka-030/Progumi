// Progumi/frontend/components/admin-terms/TermsFilter.tsx
"use client";

interface TermsFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: string[]; // DBから取得したカテゴリ一覧
}

export function TermsFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: TermsFilterProps) {
  return (
    <div className="bg-card p-4 rounded-[24px] shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
      {/* 用語名での部分一致検索 */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="用語名で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[16px] focus:outline-none focus:border-primary text-sm"
        />
      </div>
      {/* カテゴリでの絞り込み */}
      <div className="w-full sm:w-48">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[16px] focus:outline-none focus:border-primary text-sm font-medium text-foreground"
        >
          <option value="ALL">すべてのカテゴリ</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
