// Progumi/frontend/lib/api/terms.ts
// 用語関連のAPI呼び出し関数
// JWTはhttpOnly CookieのためRoute Handler経由で送信する

export type TermCreateInput = {
  category: string;
  term: string;
  description: string;
};

export type TermUpdateInput = {
  category: string;
  term: string;
  description: string;
};

export type Term = {
  id: string;
  category: string;
  term: string;
  description: string;
  created_at: string;
  updated_at: string;
};

// 用語一覧を取得する
export async function getTerms(params?: {
  category?: string;
  search?: string;
}): Promise<Term[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append("category", params.category);
  if (params?.search) query.append("search", params.search);

  const res = await fetch(`/api/admin/terms?${query.toString()}`, {
    credentials: "include", // CookieをRoute Handlerに送信
  });

  if (!res.ok) {
    throw new Error("用語一覧の取得に失敗しました。");
  }

  return res.json();
}

// 用語詳細を取得する
export async function getTerm(termId: string): Promise<Term> {
  const res = await fetch(`/api/admin/terms/${termId}`, {
    credentials: "include", // CookieをRoute Handlerに送信
  });

  if (res.status === 404) {
    throw new Error("用語が見つかりませんでした。");
  }

  if (!res.ok) {
    throw new Error("用語の取得に失敗しました。");
  }

  return res.json();
}

// 用語を新規登録する
// 管理者専用のRoute Handlerを経由してバックエンドへ送信する
export async function createTerm(input: TermCreateInput): Promise<void> {
  const res = await fetch("/api/admin/terms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // CookieをRoute Handlerに送信
    body: JSON.stringify(input),
  });

  if (res.status === 403) {
    throw new Error("この操作を行う権限がありません。");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "用語の登録に失敗しました。");
  }
}

// 用語を更新する
// 管理者専用のRoute Handlerを経由してバックエンドへ送信する
export async function updateTerm(
  termId: string,
  input: TermUpdateInput,
): Promise<void> {
  const res = await fetch(`/api/admin/terms/${termId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // CookieをRoute Handlerに送信
    body: JSON.stringify(input),
  });

  if (res.status === 403) {
    throw new Error("この操作を行う権限がありません。");
  }

  if (res.status === 404) {
    throw new Error("用語が見つかりませんでした。");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "用語の更新に失敗しました。");
  }
}

// 用語を削除する
// 管理者専用のRoute Handlerを経由してバックエンドへ送信する
export async function deleteTerm(termId: string): Promise<void> {
  const res = await fetch(`/api/admin/terms/${termId}`, {
    method: "DELETE",
    credentials: "include", // CookieをRoute Handlerに送信
  });

  if (res.status === 403) {
    throw new Error("この操作を行う権限がありません。");
  }

  if (!res.ok) {
    throw new Error("用語の削除に失敗しました。");
  }
}
