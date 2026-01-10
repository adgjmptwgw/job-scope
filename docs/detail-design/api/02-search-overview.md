# 求人検索 API 詳細設計

## エンドポイント

`GET /api/jobs`

- **概要**: 求人情報を一覧取得する。
- **パラメータ**:
  - `q` (string, optional): 自然文検索クエリ。
  - `locations` (string[], optional): 勤務地フィルタ。
  - `skills` (string[], optional): スキルタグフィルタ。
  - `min_salary` (integer, optional): 最低年収。
  - `work_styles` (string[], optional): 働き方 (Remote, Flex etc)。
  - `offset` (integer, default: 0): ページネーション用。
  - `limit` (integer, default: 20): 1回あたりの取得件数。

## レスポンススキーマ (Job List)

```json
{
  "total": 100,
  "data": [
    {
      "id": "uuid",
      "title": "Frontend Engineer",
      "company": "Tech Corp",
      "location": "Tokyo",
      "salary": "800万 - 1000万",
      "tags": ["React", "TypeScript"],
      "work_styles": ["Remote"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## システム概要図（シンプル版）

```mermaid
graph LR
    A[ユーザー入力<br/>'東京でReactの求人'] --> B[Stage 1<br/>意図理解]
    B --> C[Stage 2<br/>候補生成]
    C --> D[Stage 3<br/>検証]
    D --> E[Stage 4<br/>企業評価]
    E --> F[検索結果<br/>10件 + 根拠]
    
    style A fill:#d4e6f1,stroke:#5499c7,color:#000
    style B fill:#d5f4e6,stroke:#52be80,color:#000
    style C fill:#fdebd0,stroke:#f39c12,color:#000
    style D fill:#fadbd8,stroke:#ec7063,color:#000
    style E fill:#e8daef,stroke:#9b59b6,color:#000
    style F fill:#d6eaf8,stroke:#5dade2,color:#000
```

### 各ステージの詳細

#### Stage 1: 意図理解（Chain-of-Thought）
- **入力**: 「東京でReactの求人」
- **処理**: AIが段階的思考で要望を深く分析
  - 明示的条件: 「東京」「React」を抽出
  - 暗黙的条件: 「年収600-900万」「スタートアップまたはメガベンチャー」を推論
  - 優先度分類: 必須条件と希望条件に分類
- **出力**: 構造化された検索意図（JSON）

#### Stage 2: 候補生成（Google Search Grounding）
- **入力**: Stage 1の検索意図
- **処理**: AIが最適な「検索クエリ」を生成し、Google検索を実行
  - 特定の求人サイトに限定せず、Web全体から求人情報を探索
  - クエリ例: `React 求人 東京 年収800万 site:green-japan.com OR site:indeed.com OR site:wantedly.com OR "採用"`
  - Google検索機能（Grounding）により、実在する最新の求人ページを取得
- **出力**: 候補求人リスト（30-50件程度）

#### Stage 3: 検証（Self-Consistency）
- **入力**: 候補求人リスト
- **処理**: 候補リスト全体をまとめて3回評価（バッチ処理）
  - 1回目: 「この求人はユーザーの希望に合っていますか？」
  - 2回目: 「必須条件を満たしていますか？」
  - 3回目: 「マッチ度を0-100で評価してください」
  - 多数決で最終判定（リスト全体を一括評価）
- **出力**: 検証済み求人リスト（10-20件） + 信頼度スコア

#### Stage 4: 企業評価（Multi-Model Ensemble）
- **入力**: 検証済み求人の企業リスト
- **処理**: 企業の評判・口コミを外部ソースから収集し、複数AIで評価
  1. **情報収集**: 企業名でX（旧Twitter）、OpenWork（公開部）、Techブログ等を検索
  2. **多角的評価**:
     - Gemini: 技術力・成長性を評価（技術記事、登壇情報などから）
     - Claude: ワークライフバランス・企業文化を評価（口コミ、SNSの雰囲気から）
  3. **統合**: スコアを算出し、情報の信頼度を判定
- **出力**: 企業評価付き最終結果（10件）

---

## データフロー（詳細版）


```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザー
    participant Client as フロントエンド (Next.js)
    participant API as バックエンド API (Route Handlers)
    participant Service as SearchService
    participant Stage1 as Stage 1: 意図理解<br/>(Chain-of-Thought)
    participant Stage2 as Stage 2: 候補生成<br/>(Google Grounding)
    participant Stage3 as Stage 3: 検証<br/>(Self-Consistency)
    participant Stage4 as Stage 4: 企業評価<br/>(Multi-Model)
    participant AI as Gemini API
    participant Claude as Claude API
    participant External as 外部求人サイト

    Note over User, External: AI オーケストレーション検索フロー
    User->>Client: 検索条件入力 (自然文)
    Client->>API: GET /api/jobs (q="React...")
    API->>Service: search(query)
    
    Service->>Stage1: parseQueryWithCoT(query)
    Stage1->>AI: Chain-of-Thought プロンプト
    AI-->>Stage1: 構造化された意図 (JSON)
    Stage1-->>Service: SearchIntent DTO
    
    Service->>Stage2: generateCandidates(intent)
    Stage2->>AI: Function Calling (search_jobs_indeed etc.)
    AI-->>Stage2: 選択された関数 + パラメータ
    Stage2->>External: 求人検索 API 呼び出し
    External-->>Stage2: 求人候補リスト
    Stage2-->>Service: Job Candidates
    
    Service->>Stage3: evaluateConsistencyBatch(candidates, intent)
    loop バッチ評価（3回並列）
        Stage3->>AI: 評価プロンプト（全件リスト）
        AI-->>Stage3: 全件のスコアリスト
    end
    Stage3-->>Service: 検証済み候補
    
    Service->>Stage4: evaluateCompaniesBatch(candidates)
    par Gemini バッチ評価
        Stage4->>AI: 全企業の技術力評価
        AI-->>Stage4: 全企業の評価結果
    and Claude バッチ評価
        Stage4->>Claude: 全企業の文化評価
        Claude-->>Stage4: 全企業の評価結果
    end
    Stage4-->>Service: 統合評価結果
    
    Service-->>API: Response DTO (結果 + 根拠 + 信頼度)
    API-->>Client: 検索結果 (JSON)
    Client->>User: 求人一覧表示（透明性のある UI）
```


## AI クエリ解析ロジック

Gemini API を使用して、ユーザーの自然文入力をデータベース検索可能な構造化データ (JSON) に変換する。

### 1. プロンプト戦略

- **役割 (Role)**:
  - あなたは優秀なIT専門の採用担当者兼データアナリストです。
  - ユーザーの曖昧な要望から、具体的な検索条件を推論・抽出することが求められます。

- **タスク**:
  - ユーザーの入力文を解析し、後述する JSON スキーマに従って検索条件を出力してください。
  - 推論できない項目は `null` または空配列としてください。嘘のデータを生成してはいけません。

- **入力例と出力例 (Few-Shot)**:

  **User**: "東京で働きたい。年収は800万以上。Reactが得意です。"
  **Output**:
  ```json
  {
    "locations": ["Tokyo"],
    "min_salary": 8000000,
    "skills": ["React"],
    "employment_type": null
  }
  ```

  **User**: "リモート可で、スタートアップ企業。ジュニアレベルでもOKなところ"
  **Output**:
  ```json
  {
    "remote_available": true,
    "company_characteristics": ["Startup"],
    "experience_level": ["Junior", "Entry"],
    "min_salary": null
  }
  ```

### 2. 出力スキーマ (JSON)

Gemini からのレスポンスは以下の構造を期待する。

```json
{
  "type": "object",
  "properties": {
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "フリーワード検索用のキーワード (企業名、特殊な技術など)"
    },
    "locations": {
      "type": "array",
      "items": { "type": "string" },
      "description": "勤務地 (都道府県または主要都市)"
    },
    "min_salary": {
      "type": "integer",
      "nullable": true,
      "description": "最低年収 (日本円)"
    },
    "max_salary": {
      "type": "integer",
      "nullable": true,
      "description": "最高年収 (日本円)"
    },
    "skills": {
      "type": "array",
      "items": { "type": "string" },
      "description": "プログラミング言語、フレームワーク、ツール等"
    },
    "employment_type": {
      "type": "array",
      "items": { "type": "string", "enum": ["Full-time", "Contract", "Freelance", "Part-time"] },
      "description": "雇用形態"
    },
    "remote_available": {
      "type": "boolean",
      "nullable": true,
      "description": "リモートワーク可否"
    },
    "experience_level": {
      "type": "array",
      "items": { "type": "string", "enum": ["Junior", "Middle", "Senior", "Lead"] },
      "description": "求められる経験レベル"
    },
    "company_characteristics": {
      "type": "array",
      "items": { "type": "string" },
      "description": "企業の特徴 (e.g., Startup, Enterprise, Foreign, IPO)"
    }
  }
}
```

### 3. マッピング処理 (Logic Layer)

AIから返却された JSON を Supabase クエリに変換する。

- `locations`: `jobs.location` カラムに対して `ILIKE` または `IN` 検索。
- `min_salary`: `jobs.salary_min >= value`
- `skills`: `jobs.skills` (Array/JSONB) カラムに対して `contains` 検索。
- `company_characteristics`: `companies.tags` との照合など。

**必須フィルタ (鮮度保証)**:
すべての検索クエリに対して、以下の条件を強制的に適用する。

```sql
WHERE is_active = true 
  AND crawled_at > (NOW() - INTERVAL '30 days')
ORDER BY crawled_at DESC
```

### 4. 検索履歴の保存 (Side Effect)

ユーザーがログインしている場合、検索実行時 (`GET /api/jobs`) に以下の処理を非同期で行う。

1. **保存**: カレントユーザーID、検索条件 (JSON)、サマリーを `search_histories` テーブルに保存する。
2. **自動削除**: 保存後、当該ユーザーの履歴が **10件** を超える場合、古い履歴 (`created_at` が古い順) を削除する。

---

## 関連エンドポイント

### `GET /api/history`

- **概要**: ログインユーザーの過去の検索履歴を取得する（最大10件）。
- **レスポンス例**:
  ```json
  [
    {
      "id": "uuid-1",
      "summary": "東京, >800万, React",
      "conditions": { "locations": ["Tokyo"], "min_salary": 8000000, "skills": ["React"] },
      "created_at": "2024-01-01T10:00:00Z"
    },
    ...
  ]
  ```

## 用語集 (Terminology)

### Chain-of-Thought (思考の連鎖)
AIに対して「ステップバイステップで考えて」と指示することで、複雑な推論の精度を向上させるプロンプトエンジニアリング手法。
単に答えを求めるのではなく、中間的な思考プロセスを出力させることで、論理的な誤りを減らすことができます。(Wei et al., 2022)

### Function Calling (関数呼び出し) → Google Search Grounding
当初は「関数呼び出し」で特定のサイトを検索する予定でしたが、「あらゆるサイトから検索したい」という要件に合わせて、**Google Search Grounding**（GeminiのWeb検索機能）に変更しました。
AIが検索クエリ（例: `"React 求人 東京"`）を生成し、Google検索を通じてWeb上のあらゆる求人ページを見つけ出します。これにより、特定の求人サイトへの依存やバイアスを排除します。

### Self-Consistency (自己無撞着性)
同じプロンプトに対して複数回の推論を行い、その結果の多数決（または最も整合性の取れた回答）を採用する手法。
AIの出力にはランダム性があるため、1回だけの出力よりも、複数回試行して共通する結論を採用する方が信頼性が高まります。(Wang et al., 2022)

### Multi-Model Ensemble (マルチモデル・アンサンブル)
特性の異なる複数のAIモデル（例: 論理的思考が得意なGeminiと、文章表現が得意なClaude）を組み合わせて使用する手法。
「Multi-AI」は一般的な専門用語ではないため、機械学習分野で一般的な「Ensemble（アンサンブル）」や「Multi-Model（マルチモデル）」という表現が適切です。単一モデルのバイアスや弱点を補完し合う効果があります。
\n\n## AI API 実行回数制限 (API Usage Limits)\n\n本システムでは、コストとパフォーマンスを最適化するため、1回の検索リクエストあたりのAI API実行回数に厳格な上限を設ける。\n\n**1リクエストあたりの最大実行回数: 7回**\n\n| ステージ | 実行内容 | 回数 | 備考 |\n|---|---|---|---|\n| **Stage 1** | 意図理解 | **1回** | Gemini: ユーザー入力を解析 |\n| **Stage 2** | 候補生成 | **1回** | Gemini: 検索クエリ生成 + Google検索実行（Grounding） |\n| **Stage 3** | 検証（Self-Consistency） | **3回** | Gemini: 候補リスト全体をまとめて3回評価（バッチ処理） |\n| **Stage 4** | 企業評価（Gemini） | **1回** | Gemini: 全企業の技術力を一括評価（バッチ処理） |\n| **Stage 4** | 企業評価（Claude） | **1回** | Claude: 全企業の文化を一括評価（バッチ処理） |\n| **合計** | | **7回** | これを超える実装は認めない |\n\n※ 候補数（N）が増えても実行回数は変わらない（トークン数は増えるが、回数は固定）。\n※ キャッシュヒット時はさらに回数が減る（Stage 3, 4 はスキップ可能）。
