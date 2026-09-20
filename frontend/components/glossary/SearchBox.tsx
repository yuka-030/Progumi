// Progumi/frontend/components/glossary/SearchBox.tsx
import { useState } from "react";

type Props = {
  onSearch: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
};

export default function SearchBox({
  onSearch,
  placeholder = "Search terms...",
  initialValue = "",
}: Props) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    /* 外枠 (ピンクのコンテナ) */
    <div
      className="
        flex items-center
        w-full
        bg-background
        border border-gray-200/40
        rounded-full
        px-5 py-3
      "
    >
      {/* 🔍 検索アイコン */}
      <svg
        className="text-primary/70 ml-1 mr-4 shrink-0"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      {/* 内側の白い検索ボックス */}
      <div
        className="
          flex-1 flex
          items-center
          bg-card
          border border-gray-300
          rounded-xl
          px-4 py-2
          shadow-sm
        "
      >
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="
            flex-1
            outline-none
            text-sm
            text-foreground
            placeholder-gray-500
            bg-transparent
          "
        />

        {/* クリアボタン（入力がある時だけ表示） */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 ml-2"
            aria-label="クリア"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
