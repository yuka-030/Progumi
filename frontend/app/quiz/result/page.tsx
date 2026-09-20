// Progumi/frontend/app/quiz/result/page.tsx
// Server Component として動作させることで、
// httpOnly Cookie を直接読み取りログイン状態を判定する
import { cookies } from "next/headers";
import QuizResultClient from "../../../components/quiz/QuizResultClient";

export default async function QuizResultPage() {
  // サーバー側でCookieを読み取る（httpOnly Cookie はクライアントJSからは参照不可）
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("access_token")?.value;

  // ログイン状態をクライアントコンポーネントにpropsとして渡す
  return <QuizResultClient isLoggedIn={isLoggedIn} />;
}
