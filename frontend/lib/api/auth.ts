// Progumi/frontend/lib/api/auth.ts
type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
};

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    // サーバー側(route.ts)で設定したCookieをブラウザへ保存する
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error("メールアドレスまたはパスワードが正しくありません。");
  }

  return result;
}

export async function register(data: RegisterRequest): Promise<void> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.status === 400) {
    // メールアドレス重複など
    throw new Error(result.message ?? "このメールアドレスは既に登録されています。");
  }

  if (!response.ok) {
    throw new Error(result.message ?? "登録に失敗しました。");
  }
}