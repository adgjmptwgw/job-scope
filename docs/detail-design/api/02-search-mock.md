# 求人検索APIモック実装

## 概要

`DEMO_MODE=true`環境では、Gemini API呼び出しをモック化し、即座にダミーデータを返します。

> **Note:** `.env.local`に`DEMO_MODE=true`と`NEXT_PUBLIC_DEMO_MODE=true`を追加するだけでデモモードが有効になります。

## 実装ファイル

### [`GeminiClientMock.ts`](file:///Users/kusumotoshouichi/Desktop/job-scope/src/infrastructure/ai/GeminiClientMock.ts)

モックレスポンス生成ヘルパー。

#### 主要な関数

| 関数 | 役割 | 戻り値 |
|------|------|--------|
| `getMockSearchIntent(query)` | Stage 1: 検索意図理解のモック | `SearchIntent` |
| `getMockJobs(intent)` | Stage 2: 求人候補生成のモック | `any[]` (10件) |
| `getMockEvaluations(jobs, intent)` | Stage 3+4: 統合検証のモック | `JobWithCompanyEvaluation[]` |

---

## Stage 1: 検索意図理解のモック

### 処理内容

クエリから簡易的にキーワード抽出:

- **勤務地**: `includes('東京')` → `['東京都']`
- **スキル**: `includes('react')` → `['React']`
- **年収**: 正規表現で数値抽出 → `6000000`

### デフォルト値

```typescript
locations: ['東京都']
skills: ['TypeScript', 'React']
min_salary: 6000000
```

### 出力例

```json
{
  "explicit": {
    "locations": ["東京都", "京都府"],
    "skills": ["React"],
    "min_salary": 6000000
  },
  "implicit": {
    "role": "フロントエンドエンジニア",
    "employment_type": ["正社員"],
    "nice_to_have": ["残業少なめ", "リモートワーク"],
    "must_have": ["ワークライフバランス"]
  },
  "search_intent_summary": "東京都または京都府で、Reactを使用し、年収600万円以上の求人を探しています。"
}
```

---

## Stage 2: 求人候補生成のモック

### 処理内容

1. 10件の固定求人データを生成
2. 検索条件（勤務地、年収）でフィルタリング

### 求人データ構造

```typescript
{
  id: 'mock-job-1',
  title: 'フロントエンドエンジニア (React)',
  company: { name: '株式会社テックイノベーション' },
  location: '東京都',
  salary_min: 6500000,
  salary_max: 9000000,
  skills: ['React', 'TypeScript', 'Next.js', 'Git'],
  source_url: 'https://example.com/job/1',
  description: '...'
}
```

### 職種バリエーション

- フロントエンドエンジニア (React)
- Reactエンジニア（UI開発）
- フロントエンドエンジニア（React/TypeScript）
- シニアフロントエンドエンジニア
- Webフロントエンドエンジニア
- フロントエンドエンジニア（toB SaaS）
- Reactエンジニア（新規事業）
- フロントエンドエンジニア（EC）
- UIエンジニア
- フロントエンドエンジニア（フィンテック）

---

## Stage 3+4: 統合検証のモック

### 処理内容

各求人に以下を付与:

1. **求人マッチスコア**: 70-95のランダム値
2. **企業評価**: 関心事項ごとに65-95のランダムスコア
3. **総合スコア**: 求人マッチと企業評価の平均
4. **信頼度**: 100%（固定）

### 出力例

```typescript
{
  id: 'mock-job-1',
  title: 'フロントエンドエンジニア (React)',
  // ...求人情報
  job_match_score: 85,
  company_evaluation: {
    concerns: {
      'ワークライフバランス': {
        concern: 'ワークライフバランス',
        score: 80,
        summary: 'ワークライフバランスに関しては良好な評価が得られています。',
        sources: ['https://example.com/company-review/1']
      },
      '技術力': {
        concern: '技術力',
        score: 90,
        summary: '技術力に関しては良好な評価が得られています。',
        sources: ['https://example.com/company-review/1']
      }
    },
    overall_score: 85
  },
  overall_score: 85,
  confidence: 100
}
```

---

## GeminiClientでの統合

### [`GeminiClient.ts`](file:///Users/kusumotoshouichi/Desktop/job-scope/src/infrastructure/ai/GeminiClient.ts)

各Stage のメソッドでデモモード判定:

```typescript
// コンストラクタでフラグ設定
// DEMO_MODE環境変数でデモモードを判定
this.isDemoMode = process.env.DEMO_MODE === 'true';

// Stage 1
async parseQueryWithCoT(query: string): Promise<SearchIntent> {
  if (this.isDemoMode) {
    return getMockSearchIntent(query);
  }
  // 通常のGemini API呼び出し
}

// Stage 2
async searchWithGrounding(query: string): Promise<any[]> {
  if (this.isDemoMode) {
    const intent = getMockSearchIntent(query);
    return getMockJobs(intent);
  }
  // 通常のGemini API呼び出し
}

// Stage 3+4
async evaluateJobsWithCompanies(...): Promise<JobWithCompanyEvaluation[]> {
  if (this.isDemoMode) {
    return getMockEvaluations(candidates, intent);
  }
  // 通常のGemini API呼び出し
}
```

---

## モックデータの特徴

### 利点

✅ **即座にレスポンス**: API待機時間なし  
✅ **レート制限なし**: 何度でも実行可能  
✅ **一貫性**: 同じクエリで毎回同じ結果  
✅ **リアルなデータ**: 実際の求人に近い構造

### 制限

❌ **AIの精度検証不可**: 実際のGemini APIを使わないため  
❌ **固定データ**: クエリの細かいニュアンスは反映されない  
❌ **検索機能限定**: キーワードマッチのみ（セマンティック検索なし）

---

## 使い分け

| 環境 | 用途 | Gemini API |
|------|------|-----------|
| **Demo** | UI開発、機能テスト、デモ | ❌ モック |
| **Development** | AI精度検証、実動作確認 | ✅ 実際のAPI |
| **Production** | エンドユーザー向けサービス | ✅ 実際のAPI |

---

## 関連ファイル

- [`GeminiClientMock.ts`](file:///Users/kusumotoshouichi/Desktop/job-scope/src/infrastructure/ai/GeminiClientMock.ts) - モックデータ生成
- [`GeminiClient.ts`](file:///Users/kusumotoshouichi/Desktop/job-scope/src/infrastructure/ai/GeminiClient.ts) - デモモード統合
- [`SearchIntent.ts`](file:///Users/kusumotoshouichi/Desktop/job-scope/src/domain/types/SearchIntent.ts) - 検索意図の型定義
- [`IGeminiClient.ts`](file:///Users/kusumotoshouichi/Desktop/job-scope/src/infrastructure/ai/IGeminiClient.ts) - インターフェース定義
