// Progumi/frontend/components/auth/RegisterForm.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // 必須チェック
    if (!name || !email || !password) {
      setError("すべての項目を入力してください。");
      return;
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("正しいメールアドレスの形式で入力してください。");
      return;
    }

    // パスワード8文字以上チェック
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.status === 400) {
        // custom_http_exception_handlerの形式(data.error.message)と
        // FastAPIデフォルトの形式(data.detail)の両方に対応
        setError(data.error?.message ?? data.detail ?? "登録に失敗しました。");
        return;
      }

      if (!res.ok) {
        setError(data.message ?? "予期せぬエラーが発生しました。");
        return;
      }

      // 登録成功後、ゲストのクイズ結果があればguest_quiz_resultにコピー
      // ログイン後にAPIへ保存するための引き継ぎ用
      const quizResult = sessionStorage.getItem("progumi_quiz_result");
      if (quizResult) {
        sessionStorage.setItem("guest_quiz_result", quizResult);
      }

      // ログイン画面へ遷移
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("予期せぬエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-[16px]">
          {error}
        </div>
      )}

      {/* 名前入力 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground block">
          お名前
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 山田 太郎"
          className="w-full px-4 py-3 bg-background/30 border border-gray-200 rounded-[20px] focus:outline-none focus:border-primary text-foreground transition-all"
        />
      </div>

      {/* メールアドレス入力 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground block">
          メールアドレス
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@progumi.com"
          className="w-full px-4 py-3 bg-background/30 border border-gray-200 rounded-[20px] focus:outline-none focus:border-primary text-foreground transition-all"
        />
      </div>

      {/* パスワード入力（伏字表示・切り替えアイコン付き） */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground block">
          パスワード
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-background/30 border border-gray-200 rounded-[20px] focus:outline-none focus:border-primary text-foreground transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium focus:outline-none"
          >
            {showPassword ? "隠す" : "表示"}
          </button>
        </div>
      </div>

      {/* 登録ボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-[20px] transition-colors shadow-sm disabled:opacity-50"
      >
        {isLoading ? "登録中..." : "アカウントを作成する"}
      </button>

      {/* 画面下部導線 */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          すでにアカウントをお持ちですか？{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            ログインはこちら
          </Link>
        </p>
      </div>
    </form>
  );
}
