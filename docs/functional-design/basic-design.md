# AI 求人検索プラットフォーム 基本設計書

## 1. システム概要

### 1.1 目的・狙い

複数の求人サイトおよび外部情報源に分散した求人・企業情報を統合し、AI 検索を用いて「本当にマッチする求人・企業」を効率的に発見できる仕組みを提供する。

### 1.2 対象ユーザー

IT エンジニア、技術スタックや開発文化を重視する求職者、労働環境・企業実態を重視する転職希望者。

### 1.3 システム全体像

求人情報・企業情報・第三者の公開情報を統合し、AI が文脈・意図・評判を加味して検索結果を生成する Web サービス。

## 2. アーキテクチャ設計

### 2.1 全体アーキテクチャ

#### 構成概要

フロントエンド・バックエンド共に **Next.js (App Router)** を採用し、**Vercel** 上にデプロイする。
データベースおよび認証基盤として **Supabase** を利用し、サーバーレスかつスケーラブルな構成とする。

#### 技術スタック

- **フレームワーク**: Next.js (App Router, TypeScript)
- **スタイリング**: Tailwind CSS, shadcn/ui, Framer Motion
- **認証**: Supabase Auth
- **データベース**: Supabase (PostgreSQL)
- **インフラ/デプロイ**: Vercel
- **開発環境**: Docker (ローカル開発時の補助), DevContainer (任意)

## 3. 機能設計

### 3.1 機能一覧
(変更なし)

#### 3.2.1 画面構成
Next.js App Router のディレクトリ構造に基づき、以下のようにルーティングを設計する。

- `app/login/page.tsx`: ログイン画面
- `app/search/page.tsx`: 求人検索画面
- `app/jobs/[id]/page.tsx`: 求人詳細画面
- `app/favorites/page.tsx`: お気に入り一覧画面
- `app/settings/page.tsx`: アカウント設定画面

### 3.2.2 バックエンド API
Next.js Route Handlers (`app/api/...`) を利用する。
- 認証が必要な処理は Supabase Auth のセッション検証を行う。
- データ取得は Server Components から直接 Supabase を叩くことを推奨する（Waterfallの防止）。

## 4. データ設計

### 4.1 物理データモデル
- **Supabase (PostgreSQL)** を利用。
- `User` テーブルは Supabase Auth の `auth.users` と連携し、公開プロフィール用テーブル (`public.profiles`) を別途定義するベストプラクティス構成を採用する。

## 6. システム構成

### 6.1 インフラ構成
- **Vercel**:
  - Next.js アプリケーションのホスティング
  - Edge Network / CDN
- **Supabase**:
  - Auth: ユーザー管理
  - Database: PostgreSQL (データ保存)
  - Storage: アバター画像等の保存

### 6.2 外部連携
- 各求人サイト等への連携ロジックは Next.js API Routes または Vercel Cron Jobs にて実装を検討。

## 7. 制約事項・留意事項

#### レイヤードアーキテクチャ

クリーンアーキテクチャの原則に基づき、以下のレイヤーで構成する。

1.  **Domain Layer (Entities, Use Cases)**

    - システムのビジネスロジックの中核。フレームワークやデータベースに依存しない。
    - エンティティ (求人、企業、ユーザーなど) と、それらのエンティティに対する操作を定義するユースケース（例: 求人検索、企業情報取得、評価生成など）を含む。

2.  **Application Layer (Interfaces, DTOs)**

    - ユースケースの実行を調整し、外部からの入力を受け取り、結果を外部に出力するためのインターフェースとデータ転送オブジェクト (DTO) を定義する。
    - プレゼンテーション層やインフラ層からドメイン層へのアクセスを調整する。

3.  **Infrastructure Layer (Repositories, External Services)**

    - データベースアクセス（Prisma ORM）、外部 API 連携、ファイルシステムへのアクセスなど、具体的な技術実装を担う。
    - ドメイン層で定義されたインターフェース（リポジトリインターフェースなど）を実装する。

4.  **Presentation Layer (Controllers, UI)**
    - ユーザーインターフェース（React）と、HTTP NestJS などのフレームワークのコントローラー）を担う。
    - アプリケーション層のユースケースを呼び出し、その結果をユーザーに提示する。



- **フロントエンド**: Next.js (App Router), TypeScript, Tailwind CSS
- **UIコンポーネント**: shadcn/ui, Lucide React, Framer Motion
- **バックエンド**: Next.js Route Handlers (Serverless Functions)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **インフラ**: Vercel (Frontend/API), Supabase (DB/Auth)
- **AI**: OpenAI API (予定)


## 3. 機能設計

### 3.1 機能一覧

| No  | 機能名       | 概要                                                         | 優先度 |
| --- | ------------ | ------------------------------------------------------------ | ------ |
| 1   | AI 意味検索  | 自然文での検索条件を AI が解析し、関連求人を検索・表示する。 | 高     |
| 2   | 横断求人検索 | 複数の外部ソースから求人情報を統合し検索する。               | 高     |
| 3   | 企業実態評価 | 公開情報に基づき、AI が企業の評判や実態を要約する。          | 高     |
| 4   | 評価理由表示 | AI の評価理由や根拠となる情報源を表示する。                  | 高     |
| 5   | 除外条件指定 | ユーザーが指定した NG 条件を検索に反映する。                 | 中     |
| 6   | お気に入り機能 | 保存した求人を確認できる。 | 中     |
| 7   | アカウント設定 | パスワード、メール、プロフィール等の管理。                   | 高     |
| 8   | ユーザー認証 | ID/パスワードによる基本的な認証機能。                        | 高     |

#### 3.1.1 企業実態評価の具体例

AI検索条件の内容に基づいて、AIが項目を分割して根拠リンクを提示する。

**例：**
- **AI検索条件**：
  > 残業が少なく、社員同士の仲がいい企業を知りたいです。特にITエンジニアの開発部の職員の中がいい会社がいいです。また、有給が取りやすい風土があるかもチェックして。
- **企業実態評価の結果表示**：
  - **残業時間**
    - https://example.com/1
  - **社員同士の仲**
    - https://example.com/2
    - https://example.com/3
  - **有給の取りやすさ**
    - https://example.com/4

#### 3.2.1 画面構成

各画面の詳細な仕様については、以下の個別ドキュメントを参照のこと。

- [**ログイン画面**](./screens/01-login-screen.md): ユーザー認証機能。
- [**求人検索画面**](./screens/02-search-screen.md): 自然文検索、除外条件、結果一覧。
- [**求人詳細画面**](./screens/03-detail-screen.md): 求人詳細、AI評価理由、構造化された企業実態評価。
- [**お気に入り一覧画面**](./screens/04-favorites-screen.md): 保存した求人の管理。
- [**アカウント設定画面**](./screens/05-account-settings-screen.md): プロフィール、メール、パスワードの管理。

#### 3.2.2 バックエンド API 詳細設計

詳細なAPIエンドポイント定義およびデータフロー図については、以下のドキュメントを参照のこと。

- [**詳細設計書 (API)**](./detail-design.md)

## 4. データ設計

### 4.1 論理データモデル

#### エンティティと属性（主要なもの）

1.  **User (ユーザー)**

    - `id`: UUID (Primary Key)
    - `username`: String (Unique)
    - `email`: String (Unique)
    - `displayName`: String
    - `avatarUrl`: String
    - `passwordHash`: String
    - `createdAt`: DateTime
    - `updatedAt`: DateTime

2.  **Job (求人情報)**

    - `id`: UUID (Primary Key)
    - `title`: String
    - `companyId`: UUID (Foreign Key to Company)
    - `location`: String
    - `salary`: String
    - `description`: String
    - `requirements`: String
    - `languages`: String[]
    - `frameworks`: String[]
    - `infrastructure`: String[]
    - `salaryMinInt`: Int (最低年収、最大1400万まで指定可能)
    - `location`: String (勤務地、複数指定のタグ検索に対応)
    - `workStyles`: String[] (Remote, Flexなど)
    - `evaluationItems`: Object[] (カテゴリ別の評価項目)
        - `category`: String (例: `残業時間`, `有給の取りやすさ`)
        - `links`: String[] (根拠となる参照 URL)
    - `createdAt`: DateTime
    - `updatedAt`: DateTime

3.  **Company (企業情報)**
    ... (中略) ...

5.  **AIEvaluation (AI 評価結果)**
    - `id`: UUID (Primary Key)
    - `jobId`: UUID (Foreign Key to Job)
    - `companyId`: UUID (Foreign Key to Company)
    - `summary`: String (AI による要約)
    - `score`: Float (AI による評価スコア)
    - `reason`: String (AI による評価理由)
    - `createdAt`: DateTime

#### 4.1.1 関連性

- `Job` は `Company` に属する (多対 1)。
- `AIEvaluation` は `Job` と `Company` に関連付けられる。
- `AIEvaluation` は `ExternalInfo` を参照し、評価の根拠とする。

### 4.2 物理データモデル

- PostgreSQL を利用し、Prisma ORM のスキーマ定義に従う。
- 各エンティティはテーブルとして実装される。
- リレーションは外部キー制約として設定する。

## 5. 非機能要件 (最小限)

### 5.1 信頼性

- **稼働時間**: 平日 9 時～ 18 時を想定。時間外の停止・保守を許容する。
- **データ保全**: 週 1 回の自動バックアップを実施し、直近 1 ヶ月分のデータを AWS S3 に保持する。
- **目標復旧時間 (RTO)**: 24 時間以内 (AWS RDS のスナップショットからの復元を想定)。
- **目標復旧時点 (RPO)**: 24 時間以内 (AWS RDS のスナップショットを利用し、前日までのデータは復旧可能)。

### 5.2 セキュリティ

- **認証**: ID/パスワードによる基本的なユーザー認証。パスワードはハッシュ化して保存する。
- **データ保護**: 機密情報は扱わない。ユーザー個人情報は、匿名化または最小限の情報を扱う。API 通信は HTTPS を必須とする。
- **入力データ**: ユーザー入力に対する基本的なサニタイジング、バリデーションを実施する。
- **権限**: AWS IAM を利用し、各サービスへのアクセス権限を最小限にする。

### 5.3 保守性

- **運用性**: AWS CloudWatch Logs にエラーログ、アクセスログを出力し、異常を検知可能にする。簡易的な運用マニュアルを作成する。
- **可読性**: TypeScript の型安全性を活用し、コードの可読性と保守性を高める。
- **拡張性**: クリーンアーキテクチャの採用により、将来的な機能追加や技術変更に柔軟に対応できる構造とする。ただし、初期段階では過度な汎用化は行わない。

### 5.4 運用要件

- **監視**: AWS CloudWatch を利用し、API Gateway、Lambda/ECS、RDS などの基本的なリソース監視を実施する。
- **デプロイ**: CI/CD パイプライン（例: AWS CodePipeline/CodeBuild）を簡易的に構築し、デプロイの自動化・効率化を図る。

## 6. システム構成 (簡易版)

### 6.1 インフラ構成案

- **フロントエンド**: Vercel (Next.js Edge Network)
- **バックエンド API**: Vercel Serverless Functions
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **アセット**: Vercel Blob / Supabase Storage
- **ログ/監視**: Vercel Analytics, Vercel Logs




### 6.2 開発環境

- **ランタイム**: Node.js (v18以上推奨)
- **パッケージマネージャ**: npm
- **ローカル開発**: `npm run dev` (Next.js開発サーバー)
- **環境変数管理**: `.env.local`
- **ツール**: VS Code, Git




- **Supabase**:
  - Auth: ユーザー認証・管理
  - Database: 構造化データの永続化
- **外部求人サイト**:
  - 必要に応じて API 連携またはスクレイピングを実施（Next.js API Routes または Vercel Cron Jobs）




- **技術選定の制約**:
  - 規模が大きくならない限り、AWS Lambda, NestJS などのバックエンド技術は使用しない。
  - Next.js (App Router) + Vercel + Supabase の構成で完結させること。
  - 複雑なバックエンドロジックが必要な場合も、可能な限り Next.js Route Handlers または Supabase Edge Functions で解決する。
- **コストと運用**:
  - Vercel, Supabase の無料枠（または低コストプラン）で運用可能な構成とする。
  - 高額な外部サービスへの依存は避ける。
- **データとAI**:
  - AI の評価結果は参考情報であり最終判断はユーザーが行うものとする。
  - 扱う情報はすべて公開情報に限定する。会員登録・ログインが必要なサイトは要約対象外。
  - AI による評価は断定ではなく傾向・意見の要約として表現する。
- **機能スコープ**:
  - 求人への応募機能、企業向け管理画面はスコープ外。
- **外部情報取得**:
  - スクレイピング等は対象サイトの規約を遵守し、継続的なメンテナンスコストを考慮する。

