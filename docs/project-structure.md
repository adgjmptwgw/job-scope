# プロジェクト構成 (Folder Structure)

本プロジェクト「Job Scope」のディレクトリ構成と、各フォルダの役割について解説します。
特に、ベンダー非依存性を高めるために採用した **レイヤードアーキテクチャ (Layered Architecture)** の構成要素について詳述します。

## ルートディレクトリ

| パス | 説明 |
| :--- | :--- |
| `docker-compose.yml` | ローカル開発環境のDocker構成定義。Next.jsアプリをコンテナで起動します。 |
| `package.json` | プロジェクトの依存関係 (Next.js, React, Supabase SDK等) とスクリプト定義。 |
| `.env.local` | 環境変数設定ファイル (APIキーなど)。Git管理外。 |
| `secrets.md` | **(Git管理外)** 機密情報のメモ用ファイル。 |

---

## `src/` ディレクトリ (Source Code)

アプリケーションの主要なソースコードが格納されています。

### 1. `src/app/` (Next.js App Router)
Next.js 13+ の App Router 機能をベースとした、ページとAPIルートの定義です。

- **`src/app/api/`**: バックエンドAPIのエンドポイント (Route Handlers)。
    - ここではビジネスロジックを持たず、**Service Layer** を呼び出してレスポンスを返す役割に徹します。
- **`src/app/(pages)/`**: 各画面のページコンポーネント (`page.tsx`)。
    - `search/`: 求人検索画面
    - `jobs/[id]/`: 求人詳細画面
    - `settings/`: 設定画面

### 2. `src/domain/` (Domain Layer) ⭐️重要
**特定の技術やフレームワーク（SupabaseやNext.js）に依存しない**、純粋なビジネスルールやデータ型を定義する層です。

- **`entities/`**: データの型定義 (Interface/Type)。
    - e.g. `Job.ts`: 求人データの型定義。DBのスキーマと完全に一致するとは限らず、アプリで扱う「概念」を定義します。
- **`repositories/`**: データの読み書きを行うための **インターフェース** 定義。
    - e.g. `IJobRepository.ts`: 「IDで求人を探す」という操作の定義のみ行います。具体的なSQLやSupabaseのコードは書きません。
- **`services/`**: ビジネスロジック。
    - e.g. `JobService.ts`: Repositoryを利用してデータを取得し、加工や判定を行うロジック。

### 3. `src/infrastructure/` (Infrastructure Layer) ⭐️重要
Domain Layer で定義されたインターフェースの **具体的な実装** を置く層です。外部サービスへの依存はここに閉じ込めます。

- **`repositories/`**: Repositoryインターフェースの実装クラス。
    - e.g. `SupabaseJobRepository.ts`: Supabaseクライアントを使って実際にデータを取得する処理。
    - ※将来的にDBをFirebaseやRDBに移行する場合、このディレクトリ内のファイルを差し替えるだけで対応できます。

### 4. `src/components/` (UI Components)
- **`ui/`**: 汎用的なUIコンポーネント (Button, Input, Dialogなど)。shadcn/ui ベース。
- その他、機能固有のコンポーネント。

### 5. `src/lib/` (Shared Libraries)
- **`supabase/`**: Supabaseクライアントの初期化コード (`client.ts`, `server.ts`)。

---

## `docs/` ディレクトリ (Documentation)

- **`detail-design/`**: 詳細設計書。
    - `api/`: API仕様書。
    - `db/`: データベース設計書 (Schema, ER図)。
- **`functional-design/`**: 基本設計、画面設計、システム構成図。
- **`sql/`**: (廃止) 以降は `supabase/migrations` を使用。

## `supabase/` ディレクトリ

- **`migrations/`**: データベースのマイグレーション用SQLファイル。
    - テーブル作成や変更を行うためのSQLスクリプトを `NNN_description.sql` 形式で管理します。
