// Progumi/frontend/components/auth/LoginForm.tsx
"use client";

import { login } from "@/lib/api/auth";
import { saveQuizResultToAPI } from "@/lib/api/quizResult";
import { clearQuizResult, getQuizResult } from "@/lib/utils/quizSession";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // パスワード表示切り替え用
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // セッションストレージにゲストのクイズデータがあるか確認
  const hasGuestData =
    typeof window !== "undefined" &&
    !!sessionStorage.getItem("guest_quiz_result");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // -------------------------------------------------------------
    // 1. バリデーションチェック
    // -------------------------------------------------------------
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setIsLoading(true);

    try {
      // -------------------------------------------------------------
      // 2. 実際のユーザーログイン処理
      // -------------------------------------------------------------
      const loginData = await login({ email, password });
      const userRole = loginData.role; // 'admin' または 'user' など

      // -------------------------------------------------------------
      // 3. クイズデータの引き継ぎフロー
      // -------------------------------------------------------------
      const guestQuizRaw = sessionStorage.getItem("guest_quiz_result");

      if (guestQuizRaw) {
        // guest_quiz_resultをprogumi_quiz_resultキーにセットしてgetQuizResultで読み込む
        sessionStorage.setItem("progumi_quiz_result", guestQuizRaw);
        const quizResult = getQuizResult();

        if (quizResult) {
          try {
            // POST /api/quiz/history へ一括保存
            await saveQuizResultToAPI(quizResult);

            // 🎉 保存成功後にセッションをクリア
            clearQuizResult();
            sessionStorage.removeItem("guest_quiz_result");
          } catch (quizError: unknown) {
            // セッションは消さずに残す（後でマイページ等から再試行できるように）
            setError(
              "ログインは完了しましたが、クイズ結果の同期に失敗しました。履歴画面から再試行してください。",
            );
            router.push("/history");
            return;
          }
        }
      }

      // -------------------------------------------------------------
      // 4. ログイン成功後の画面遷移（認可制御）
      // -------------------------------------------------------------
      if (userRole === "admin") {
        router.push("/admin"); // 管理者はダッシュボードへ
      } else {
        router.push("/"); // 一般ユーザーは最近の学習状況を表示したTopへ
      }
      router.refresh();
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
      {/* クイズ結果保持時のアナウンス（データがある場合のみ自動で表示） */}
      {hasGuestData && (
        <div className="bg-accent/10 border border-accent/30 text-foreground text-sm p-4 rounded-[16px] font-medium">
          💡 <strong>ログインすると</strong>
          、先ほどのクイズ結果が自動的にアカウントに保存されます！
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-[16px]">
          {error}
        </div>
      )}

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

      {/* ログインボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-primary hover:bg-[#6659c2] text-white font-bold rounded-[20px] transition-colors shadow-sm disabled:opacity-50"
      >
        {isLoading ? "ログイン中..." : "ログインする"}
      </button>

      {/* 画面下部導線 */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            新規登録はこちら
          </Link>
        </p>
      </div>
    </form>
  );
}
