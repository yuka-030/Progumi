// Progumi/frontend/app/admin/terms/new/page.tsx
"use client";

import { TermForm } from "@/components/admin-terms/TermForm";
import Link from "next/link";

export default function AdminTermCreatePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      {/* パンくず＆ヘッダーナビゲーション */}
      <div className="mb-6">
        <div className="text-xs text-gray-400 mb-10">
          <Link href="/admin" className="hover:underline">
            管理者ダッシュボード
          </Link>{" "}
          &gt;{" "}
          <Link href="/admin/terms" className="hover:underline">
            用語管理一覧
          </Link>{" "}
          &gt; <span className="text-gray-600">用語の新規登録</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground mb-4">
            用語の新規登録
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            プログミに新しく掲載するプログラミング用語の登録
          </p>
        </div>
      </div>

      {/* フォーム入力エリア（設計書：カード背景 テーマのcard、角丸大きめ 24px） */}
      <div className="bg-card rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 max-w-2xl">
        <TermForm />
      </div>
    </div>
  );
}
