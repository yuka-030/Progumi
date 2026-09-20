// Progumi/frontend/app/register/page.tsx
import { AuthCard } from "../../components/auth/AuthCard";
import { RegisterForm } from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthCard>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">アカウント作成</h1>
          <p className="text-sm text-gray-500 mt-2">
            プログミで新しい学習を始めましょう！
          </p>
        </div>

        {/* 新規登録フォーム本体 */}
        <RegisterForm />
      </AuthCard>
    </div>
  );
}