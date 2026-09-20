"use client";

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-card">
      <h1 className="text-lg font-bold text-foreground">
        管理者ダッシュボード
      </h1>
      <div className="flex items-center gap-3">
        {/* アバターアイコンのダミー */}
        <div className="w-8 h-8 rounded-full bg-primary/20" />
      </div>
    </header>
  );
}