# 開発方針ドキュメント

## 概要

要件定義（Issue #1）および初期README（Issue #2）をもとに、チーム4人で円滑に開発を進めるためのルールを定義する。

認識のズレや手戻りを防ぎ、限られた開発期間の中でMVP完成を目指す。

---

# 1. チーム体制・役割分担

## ①フロントエンド担当

担当範囲

- Topページ
- 用語集ページ
- クイズページ
- frontend-public-design.md

---

## ②フロントエンド担当

担当範囲

- 新規登録
- ログイン
- 管理画面
- frontend-admin-design.md

---

## ③バックエンド担当

担当範囲

- FastAPI
- API実装
- JWT認証
- AI API連携
- api-design.md

---

## ④データベース担当

担当範囲

- PostgreSQL設計
- Seedデータ作成
- ER図作成
- database-design.md
- フロントエンド・バックエンド結合作業

---

## レビューで困った場合

1. チーム連絡ツールで相談する
2. MTGで議題として共有する

---

## MTG参加できない場合

- チーム連絡ツールで事前連絡する
- 議事録を確認する
- 必要に応じて後日キャッチアップする

---

# 2. 開発フロー

## ブランチ戦略

GitHub Flow を採用する。(今回はdevelop使わない)

```text
main
 └─ feature/*
```

開発は各 Issue ごとにブランチを作成し、Pull Request を通して main へマージする。AIレビューに困ったときは相談する。

---

## ブランチ命名規則

Issueごとに作成する。

例

```text
feature/login
feature/quiz-api
feature/admin-page

fix/login-bug

docs/database-design
docs/readme
```

---

## Pull Requestルール

- Issueと紐付ける
- 動作確認を行う
- セルフレビューを行う  
例
  ```
  @aitutor-review review
  === 対応内容をここに記述 ===
  ```
- AIレビュー後に致命的なものがなければマージする (迷うときはメンバーに相談)
- コンフリクトがある場合は解消してからレビュー依頼する

---

## Issueとの紐付け

PR作成時にIssue概要をコピペしてブランチ名のところを削除→対象Issue番号を記載する。  
※ 対応箇所はチェックボックスにチェックを入れてください。

例

```text
Closes #12
```
例
```
## タスク
- [x] 〇〇
- [ ] 〇〇
```
※ 空のチェックボックスのままコメント書いて、後から□をクリックでもOK

---

# 3. コミットメッセージ規則

Conventional Commits をベースとする。

形式

```text
<type>: 内容
```

利用する type

| type     | 説明                                           |
| -------- | ---------------------------------------------- |
| feat     | 新しい機能                                     |
| fix      | バグの修正                                     |
| docs     | ドキュメントのみの変更                         |
| style    | 空白、フォーマット、セミコロン追加など         |
| refactor | 仕様に影響がないコード改善（リファクタリング） |
| perf     | パフォーマンス向上関連                         |
| test     | テスト関連                                     |
| chore    | ビルド、補助ツール、ライブラリ関連             |

---

## feat

新機能追加

例

```text
feat: ログインAPIを追加

feat: 用語一覧取得機能を追加

feat: クイズ結果保存機能を追加
```

---

## fix

不具合修正

修正対象が分かるように記載する。

形式

```text
fix: [ファイル名] or [関数名] 修正内容
```

例

```text
fix: auth.py login_user 認証エラーを修正

fix: QuizPage クイズ結果表示の不具合を修正

fix: terms APIレスポンスの型不一致を修正
```

---

## docs

ドキュメント修正

例

```text
docs: database-design.md テーブル定義を更新

docs: README 環境構築手順を追加
```

---

## style

フォーマット修正

例

```text
style: インデントを統一

style: Prettier適用

style: 不要な空行を削除
```

---

## refactor

動作変更なしのリファクタリング

例

```text
refactor: QuizService クイズ生成処理を分離

refactor: TermList コンポーネントを共通化
```

---

## perf

パフォーマンス改善

例

```text
perf: クイズ取得処理のSQLを改善

perf: APIレスポンス速度を改善
```

---

## test

テスト追加・修正

例

```text
test: login APIの単体テストを追加

test: 用語一覧取得APIのテストを追加
```

---

## chore

設定変更・依存関係更新

例

```text
chore: Docker設定を追加

chore: Ruff設定を更新

chore: ライブラリをアップデート
```

---

## NG例

```text
fix

修正

変更

対応

update
```

何を修正したのか分からないコミットメッセージは禁止とする。

---

## 推奨事項

コミット履歴を見た際に、

- 何を変更したか
- どの機能か
- どのファイル・処理か

が分かる内容を記載する。

---

# 4. 環境・設定の共有方針

## 環境変数

- `.env.example` を管理する
- `.env` はGit管理しない
- APIキーやパスワードはコミットしない

## Git管理対象外ファイル

以下は `.gitignore` に追加し、GitHubへコミットしない。

### 共通

```text
.env
.env.local
.env.development
.env.production

node_modules

.DS_Store
Thumbs.db
```

---

### Frontend (Next.js)

```text
.next
out
coverage
```

---

### Backend (Python)

```text
__pycache__
.pytest_cache
.ruff_cache

*.pyc
*.pyo
*.pyd

htmlcov
.coverage

.venv
venv
```

---

### IDE設定

個人設定はコミットしない。

```text
.vscode/settings.json
.idea
```

---

## ローカル開発環境

Dockerを利用する。

全メンバーが同一環境で開発する。

---

## 開発環境URL

```text
Frontend
http://localhost:3000

Backend API
http://localhost:8000

Swagger UI
http://localhost:8000/docs
```

---

# 5. コーディング規約

## Frontend

- TypeScript
- ESLint
- Prettier

### 命名規則

コンポーネント

```text
PascalCase
```

例

```text
QuizCard.tsx
TermList.tsx
LoginForm.tsx
```

---

## Backend

- PEP8準拠
- Ruff
- 型ヒントを利用する

### 命名規則

関数・変数

```text
snake_case
```

例

```text
create_quiz()
get_terms()
save_quiz_result()
```

---

# 6. テスト方針

## 単体テスト

対象

- APIロジック
- クイズ生成ロジック
- DB操作

担当

- ***

## 統合テスト

対象

```text
Frontend
↓
Backend API
↓
Database
```

担当

- ***

## E2Eテスト

可能であれば自動化

---

## テスト基準

最低限以下を確認する。

### 認証

- 新規登録
- ログイン

### 用語集

- 一覧取得
- 詳細取得

### クイズ

- 出題
- 結果表示

### 履歴

- 保存
- 閲覧

### 管理画面

- CRUD

---

# 7. コミュニケーション方針

## 進捗共有

- チーム連絡ツール
- 定期MTG

---

## 質問・相談

チーム連絡ツールを利用する。

疑問点は早めに共有する。

---

## ドキュメント更新

担当者が更新する。

設計変更時は関連ドキュメントも更新する。

---

# 8. 開発スケジュール

## ドキュメント作成期間

対象

- requirements.md
- README.md
- database-design.md
- api-design.md
- frontend-public-design.md
- frontend-admin-design.md
- dev-guidelines.md

木曜日までに完成させる。

---

## Day1〜Day3

各担当のMVP実装

### DB担当

- PostgreSQL構築
- 初期Seed作成（terms 10件）

### API担当

- FastAPI構築
- 認証機能
- 用語集API
- クイズAPI

### UI担当

- 画面実装
- モックデータ実装

---

## Day4（日曜日目標）

結合作業

```text
Frontend
↓
Backend API
↓
Database
```

を接続する。

---

## Day5（月曜日）

- 結合確認
- 不具合修正
- テスト計画確認MTG

---

## Day6〜Day7

- 単体テスト
- 統合テスト
- バグ修正
- デモ準備

---

# 9. MVPゴール

デモまでに以下を完成させる。

- 用語集
- AIによる4択クイズ
- 新規登録
- ログイン
- クイズ履歴保存
- 管理画面CRUD

---

# 10. 今後の展望

- 学習分析レポート
- 苦手分野分析
- 問題ごとの正答率分析
- Redis導入
- レスポンシブ対応強化
- UI/UX改善
- クイズ出題アルゴリズム改善
