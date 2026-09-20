// Progumi/frontend/components/admin-terms/TermForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

// フォームが受け取る初期値の型定義
// DBのTermモデルに合わせたフィールド名（category / term / description）
interface TermFormValues {
  category: string;
  term: string;
  description: string;
}

interface TermFormProps {
  termId?: string; // 編集時のID（新規登録時は不要）
  initialValues?: TermFormValues;
  isEditMode?: boolean;
}

export function TermForm({
  termId,
  initialValues,
  isEditMode = false,
}: TermFormProps) {
  const router = useRouter();

  // フォームのステート管理
  const [values, setValues] = useState<TermFormValues>(
    initialValues || {
      category: "",
      term: "",
      description: "",
    },
  );

  // エラーメッセージ管理用のステート
  const [errors, setErrors] = useState<
    Partial<Record<keyof TermFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // カテゴリー一覧をAPIから取得
  const [categories, setCategories] = useState<string[]>([]);
  // 自由入力モードかどうか
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/terms/categories`,
        );
        if (!res.ok) return;
        const data: string[] = await res.json();
        setCategories(data);
      } catch {
        // 取得失敗時は自由入力にフォールバック
        setIsCustomCategory(true);
      }
    };
    fetchCategories();
  }, []);

  // 入力時のバリデーション＆値反映
  const handleChange = (key: keyof TermFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  // 送信時のバリデーションロジック（設計書「6-5」準拠）
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TermFormValues, string>> = {};

    if (!values.term.trim()) {
      newErrors.term = "用語名は必須入力です。";
    } else if (values.term.length > 255) {
      newErrors.term = "用語名は255文字以内で入力してください。";
    }

    if (!values.category) {
      newErrors.category = "カテゴリを選択 または 入力してください。";
    }

    if (!values.description.trim()) {
      newErrors.description = "解説は必須入力です。";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存（Submit）処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      // 編集時はIDを含むURL、新規登録時は一覧URLを使用
      const url = isEditMode
        ? `/api/admin/terms/${termId}`
        : `/api/admin/terms`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.status === 403) {
        // 管理者以外のアクセス
        setServerError("この操作を行う権限がありません。");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.message ?? "保存に失敗しました。");
        return;
      }

      // 保存成功後、一覧画面へ遷移
      router.push("/admin/terms");
      router.refresh();
    } catch {
      setServerError("通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl h-auto">
      {/* サーバーエラー表示 */}
      {serverError && (
        <div className="bg-red-50 border border-red-400 rounded-2xl p-4">
          <p className="text-sm font-bold text-red-600">⚠️ {serverError}</p>
        </div>
      )}

      {/* 1. 用語名入力欄（インライン実装） */}
      <div className="space-y-2 text-left w-full">
        <label className="text-sm font-bold text-foreground block">
          用語名 <span className="text-red-500 text-xs">*</span>
        </label>
        <input
          type="text"
          placeholder="例: コンポーネント"
          value={values.term}
          onChange={(e) => handleChange("term", e.target.value)}
          className={`w-full px-4 py-3 bg-background/30 border rounded-[20px] focus:outline-none focus:border-primary text-sm text-foreground transition-all ${
            errors.term
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200"
          }`}
        />
        {errors.term && (
          <p className="text-xs text-red-500 font-semibold pl-2">
            ⚠️ {errors.term}
          </p>
        )}
      </div>

      {/* 2. カテゴリ選択（プルダウン + 自由入力） */}
      <div className="space-y-2 text-left">
        <label className="text-sm font-bold text-foreground block">
          カテゴリ <span className="text-red-500 text-xs">*</span>
        </label>
        {!isCustomCategory ? (
          <div className="relative">
            <select
              value={values.category}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  // 「新しいカテゴリを入力する」を選んだら自由入力モードへ切り替え
                  setIsCustomCategory(true);
                  handleChange("category", "");
                } else {
                  handleChange("category", e.target.value);
                }
              }}
              className={`w-full px-4 py-3 pr-10 bg-background/30 border rounded-[20px] focus:outline-none focus:border-primary text-sm text-gray-600 transition-all appearance-none ${
                errors.category
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200"
              }`}
            >
              <option value="" disabled>
                カテゴリを選択してください
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__custom__">＋ 新しいカテゴリを入力する</option>
            </select>
            {/* カスタム矢印アイコン */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="新しいカテゴリを入力"
              value={values.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={`flex-1 px-4 py-3 bg-background/30 border rounded-[20px] focus:outline-none focus:border-primary text-sm text-foreground transition-all ${
                errors.category ? "border-red-400" : "border-gray-200"
              }`}
            />
            {/* 既存カテゴリ選択に戻るボタン */}
            <button
              type="button"
              onClick={() => {
                setIsCustomCategory(false);
                handleChange("category", "");
              }}
              className="px-4 py-3 text-xs text-gray-500 border border-gray-200 rounded-[20px] hover:bg-gray-50"
            >
              一覧から選ぶ
            </button>
          </div>
        )}
        {errors.category && (
          <p className="text-xs text-red-500 font-semibold pl-2">
            ⚠️ {errors.category}
          </p>
        )}
      </div>

      {/* 3. 解説 */}
      <div className="h-auto space-y-2 text-left">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-foreground">
            解説 <span className="text-red-500 text-xs">*</span>
          </label>
        </div>
        <textarea
          rows={8}
          placeholder="用語について、分かりやすい解説を記入してください"
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={`w-full h-6xl px-4 py-3 bg-background/30 border rounded-[20px] focus:outline-none focus:border-primary text-sm text-foreground transition-all resize-none ${
            errors.description
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-red-500 font-semibold pl-2">
            ⚠️ {errors.description}
          </p>
        )}
      </div>

      {/* 4. 操作ボタンエリア */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => {
            if (confirm("入力内容を破棄して一覧に戻りますか？")) {
              router.push("/admin/terms");
            }
          }}
          className="w-full sm:w-auto px-6 py-3 bg-card hover:bg-gray-50 text-gray-500 font-bold text-sm rounded-[20px] border border-gray-200 transition-colors order-2 sm:order-1"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-[20px] shadow-sm shadow-primary/20 transition-colors order-1 sm:order-2 disabled:opacity-50"
        >
          {isSubmitting ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
