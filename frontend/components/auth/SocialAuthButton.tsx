"use client";

interface SocialAuthButtonProps {
  provider: "google" | "github";
  onClick?: () => void;
}

export function SocialAuthButton({ provider, onClick }: SocialAuthButtonProps) {
  // プロバイダーごとの見た目の設定（設計書のトーン＆マナーに準拠）
  const isGoogle = provider === "google";

  const buttonText = isGoogle ? "Googleでログイン" : "GitHubでログイン";

  // 各SNSの簡易ロゴ（SVG）
  const logo = isGoogle ? (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.304 2.114 15.56 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.99 0-.743-.073-1.32-.174-1.885H12.24z"
      />
    </svg>
  ) : (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center py-3 px-4 bg-card hover:bg-gray-50 text-foreground font-semibold rounded-[20px] border border-gray-200 transition-colors text-sm shadow-sm"
    >
      {logo}
      {buttonText}
    </button>
  );
}
