// Progumi/frontend/app/login/page.tsx
import { AuthCard } from "../../components/auth/AuthCard";
import { LoginForm } from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthCard>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            プログミにログイン
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            プログラミング用語とクイズで学ぼう
          </p>
        </div>

        {/* ログインフォーム本体 */}
        <LoginForm />
      </AuthCard>
    </div>
  );
}
