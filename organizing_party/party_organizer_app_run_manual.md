# 飲み会幹事アプリ 環境構築・実行手順書

**Version 1.0　2026年4月**

---

## 1. 前提条件

以下のアカウント・ツールを事前に準備してください。

| ツール／サービス | 用途 | 備考 |
|---|---|---|
| Node.js（v18以上） | フロントエンド開発 | https://nodejs.org |
| GitHubアカウント | ソースコード管理 | Vercel連携に必要 |
| Supabaseアカウント | DB・認証 | https://supabase.com（無料） |
| Vercelアカウント | ホスティング | https://vercel.com（無料） |

---

## 2. Supabase セットアップ

### 2.1 プロジェクト作成

1. supabase.com にログインし「New Project」をクリック
2. プロジェクト名・パスワード・リージョン（Northeast Asia）を入力して作成
3. 作成完了後、Settings > API から以下の値をメモする

| キー | 説明 |
|---|---|
| Project URL | `VITE_SUPABASE_URL` に設定する |
| anon public key | `VITE_SUPABASE_ANON_KEY` に設定する |

### 2.2 テーブル作成

Supabase ダッシュボードの SQL Editor で以下を実行する。

```sql
-- イベントテーブル
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'open',
  decided_datetime_id UUID,
  decided_venue_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 日時候補テーブル
CREATE TABLE event_datetimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  candidate_date DATE NOT NULL,
  candidate_time TIME NOT NULL
);

-- 候補店舗テーブル
CREATE TABLE event_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url_or_address TEXT,
  note TEXT
);

-- 回答テーブル
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  name TEXT,
  attending BOOLEAN,
  selected_venue_id UUID REFERENCES event_venues(id),
  note TEXT,
  answered_at TIMESTAMPTZ
);

-- 日時回答テーブル（参加者が選んだ日時、複数選択可）
CREATE TABLE response_datetimes (
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  datetime_id UUID REFERENCES event_datetimes(id) ON DELETE CASCADE,
  PRIMARY KEY (response_id, datetime_id)
);
```

### 2.3 認証設定

1. Supabase ダッシュボードの Authentication > Providers を開く
2. Email を有効化する（幹事のログインに使用）
3. 必要に応じて「Confirm email」を無効化（開発中は便利）

### 2.4 RLS（Row Level Security）設定

> 本番運用前に必ず設定すること。開発中は無効でも動作する。

```sql
-- events テーブルの RLS を有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがイベントを読める（参加者の閲覧用）
CREATE POLICY "events_read" ON events FOR SELECT USING (true);

-- 認証済みユーザーのみ作成可能（幹事）
CREATE POLICY "events_insert" ON events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

---

## 3. フロントエンド セットアップ

### 3.1 プロジェクト作成

1. ターミナルで以下を実行

```bash
npm create vite@latest kanji-app -- --template react-ts
cd kanji-app
npm install
```

2. Supabase クライアントをインストール

```bash
npm install @supabase/supabase-js
```

### 3.2 環境変数設定

1. プロジェクトルートに `.env` ファイルを作成

```
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. `.gitignore` に `.env` が含まれていることを確認

### 3.3 Supabase クライアント初期化

`src/lib/supabase.ts` を作成する。

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 3.4 ローカル起動確認

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセスして動作を確認する。

---

## 4. GitHub リポジトリ連携

1. GitHub で新規リポジトリを作成
2. ローカルと紐付け

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/{your-name}/kanji-app.git
git push -u origin main
```

---

## 5. Vercel デプロイ

1. vercel.com にログインし「Add New Project」をクリック
2. GitHubリポジトリ（kanji-app）をインポート
3. Environment Variables に以下を追加

| キー | 値 |
|---|---|
| `VITE_SUPABASE_URL` | SupabaseのProject URL |
| `VITE_SUPABASE_ANON_KEY` | Supabaseのanon public key |

4. 「Deploy」をクリック
5. デプロイ完了後、発行されたURLで動作確認

**以降はmainブランチへのpushで自動デプロイされる。**

---

## 6. 開発フロー

| フェーズ | 内容 |
|---|---|
| ローカル開発 | `npm run dev` でローカル起動。SupabaseはDBを本番共用でもOK |
| コミット | `git push` で自動的にVercelがプレビューURLを発行 |
| 本番反映 | mainブランチへのマージで自動デプロイ |

---

## 7. 注意事項

- Supabase の無料枠：DBは500MB、認証ユーザー数は無制限。このアプリ規模では問題なし
- Vercel の無料枠：帯域100GB/月。社内利用なら十分
- `.env` ファイルは絶対にGitにコミットしない
- 本番リリース前にRLSポリシーを必ず設定すること