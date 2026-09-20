// Progumi/frontend/components/admin-terms/TermsTable.tsx
"use client";

import Link from "next/link";

interface Term {
  id: string; // UUIDはstring型
  term: string;
  category: string;
  updated_at: string;
}

interface TermsTableProps {
  terms: Term[];
  onDeleteClick: (id: string, title: string) => void;
}

// YYYY-MM-DD と hh:mm を別々に取得して整形する
function formatDateParts(dateString: string): { date: string; time: string } {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
}

export function TermsTable({ terms, onDeleteClick }: TermsTableProps) {
  return (
    <div className="bg-card rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-4 px-6 w-20">ID</th>
              <th className="py-4 px-6">用語名</th>
              <th className="py-4 px-6 w-46">カテゴリ</th>
              <th className="py-4 px-6 w-36">最終更新日</th>
              <th className="py-4 px-6 w-40 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {terms.length > 0 ? (
              terms.map((term, index) => {
                const { date, time } = formatDateParts(term.updated_at);
                return (
                  <tr
                    key={term.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* UUIDは長いため連番で表示 */}
                    <td className="py-4 px-6 font-mono text-gray-400">
                      #{index + 1}
                    </td>
                    <td className="py-4 px-6 font-bold text-foreground">
                      {term.term}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                        {term.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <div className="flex flex-col leading-tight">
                        <span>{date}</span>
                        <span className="text-xs text-gray-400">{time}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <Link
                          href={`/admin/terms/${term.id}/edit`}
                          className="text-primary hover:text-[#685bc2] font-semibold text-xs hover:underline"
                        >
                          編集
                        </Link>
                        <span className="text-gray-200">|</span>
                        <button
                          onClick={() => onDeleteClick(term.id, term.term)}
                          className="text-red-500 hover:text-red-700 font-semibold text-xs hover:underline"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-gray-400 font-medium"
                >
                  該当する用語が見つかりませんでした。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
