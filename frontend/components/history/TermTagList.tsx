// Progumi/frontend/components/history/TermTagList.tsx
import Link from "next/link";
import { StudiedTerm } from "@/types/history";

type Props = {
  terms: StudiedTerm[];
};

export default function TermTagList({ terms }: Props) {
  if (terms.length === 0) {
    return <p className="text-sm text-gray-400">学習した用語はありません</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {terms.map((item, index) => (
        <Link
          key={`${item.term}-${index}`}
          href={`/glossary?category=${encodeURIComponent(item.category)}&search=${encodeURIComponent(item.term)}`}
        >
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.is_correct
                ? "bg-green-50 text-green-600 border border-green-400"
                : "bg-red-50 text-red-600 border border-red-400"
            }`}
          >
            {item.term}
          </span>
        </Link>
      ))}
    </div>
  );
}