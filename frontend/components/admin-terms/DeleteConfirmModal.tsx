"use client";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  termTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  termTitle,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景の黒いオーバーレイ */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダルコンテンツ（設計書：カード背景 テーマcard、角丸大きめ） */}
      <div className="bg-card rounded-[28px] shadow-xl border border-gray-100 max-w-sm w-full p-6 relative z-10 text-center space-y-6 animate-fade-in">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xl mx-auto">
          ⚠️
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-black text-foreground">
            用語の削除確認
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            「<span className="font-bold text-foreground">{termTitle}</span>
            」を本当に削除しますか？
            <br />
            この操作は取り消すことができません。
          </p>
        </div>

        {/* アクションボタン（設計書：角丸 20px 仕様） */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold text-xs rounded-[18px] border border-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-[18px] transition-colors shadow-sm shadow-red-500/10"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
