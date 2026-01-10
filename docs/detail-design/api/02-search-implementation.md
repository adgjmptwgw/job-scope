# 求人検索 API 詳細設計（改訂版: AI オーケストレーション）

## 変更履歴
- 2026-01-05: AI オーケストレーション方式に全面改訂（クローリング不要版）

---

## エンドポイント

`GET /api/jobs`

- **概要**: AI による4段階処理で高精度な求人検索を実現する
- **パラメータ**:
  - `q` (string, required): 自然文検索クエリ
  - `offset` (integer, default: 0): ページネーション用
  - `limit` (integer, default: 20): 1回あたりの取得件数

※ 従来の `locations`, `skills` 等の構造化パラメータは不要（AIが自動抽出）

---

## レスポンススキーマ

```json
{
  "total": 10,
  "query_interpretation": {
    "explicit_conditions": {
      "locations": ["東京"],
      "skills": ["React"]
    },
    "implicit_conditions": {
      "min_salary": 6000000,
      "company_size": ["Startup", "MidSize"]
    },
    "must_have": ["React", "東京"],
    "nice_to_have": ["TypeScript", "リモート可"]
  },
  "data": [
    {
      "id": "uuid",
      "title": "Frontend Engineer (React)",
      "company": {
        "name": "Tech Startup Inc.",
        "evaluation": {
          "technical_score": 85,
          "culture_score": 90,
          "overall_score": 87.5,
          "summary": "技術力が高く、フラットな組織文化が特徴",
          "sources": [...]
        }
      },
      "location": "東京都",
      "salary": "600万 - 900万",
      "skills": ["React", "TypeScript", "Next.js"],
      "match_score": 95,
      "confidence": 100,  // Self-Consistency 結果 (3/3回一致)
      "match_reasons": [
        "✓ React の実務経験が必須条件に合致",
        "✓ 東京都内の求人",
        "✓ 想定年収レンジが希望範囲内"
      ],
      "apply_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## 4段階 AI 処理の詳細

### Stage 1: 意図理解（Chain-of-Thought）

#### 目的
ユーザーの曖昧な要望を、段階的思考により深く理解する

#### プロンプト戦略

```
あなたは10年のキャリアを持つ優秀な転職エージェントです。
ユーザーの要望を段階的に分析し、最適な求人を探すための条件を整理してください。

【ステップ1: 明示的条件の抽出】
ユーザーが明示的に述べている条件をリストアップしてください。
- 勤務地
- 技術スタック
- 年収
- 働き方
- その他

【ステップ2: 暗黙的条件の推論】
ユーザーが述べていないが、文脈から推測できる条件を挙げてください。
例: 
- "React経験者" → 年収600万以上を期待している可能性
- "スタートアップ" → フラットな組織文化を求めている可能性

【ステップ3: 優先度の分類】
条件を以下に分類してください:
- 絶対条件 (must_have): これがないとNG
- 希望条件 (nice_to_have): あれば嬉しい

【ステップ4: JSON出力】
以下の形式で出力してください:
{
  "explicit_conditions": {...},
  "implicit_conditions": {...},
  "must_have": [...],
  "nice_to_have": [...]
}

ユーザー入力: "${userQuery}"
```

#### 実装例
```typescript
async function parseQueryWithChainOfThought(query: string): Promise<SearchIntent> {
  const prompt = buildCoTPrompt(query);
  const response = await gemini.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2, // 低めで一貫性を保つ
      maxOutputTokens: 1024
    }
  });
  
  return JSON.parse(extractJSON(response.text()));
}
```

### 実データフロー例 (Concrete Example)

#### Stage 1: 意図理解 (Chain-of-Thought)

**User Input**: 「東京でReactの案件ないかな」

**Prompt (Input to Gemini)**:
```text
ユーザーの要望を分析してください。
入力: "東京でReactの案件ないかな"

Step 1: 明示的条件（ユーザーが言ったこと）
Step 2: 暗黙的条件（文脈から推測されること）
  - "案件" → 正社員だけでなくフリーランスも視野に入れている可能性
  - "React" → モダンなフロントエンド環境
Step 3: JSONとして構造化
```

**Response (Output from Gemini)**:
```json
{
  "explicit": {
    "location": "東京",
    "technical_stack": ["React"]
  },
  "implicit": {
    "role": "Frontend Engineer",
    "employment_type": ["Full-time", "Freelance"],
    "min_salary": null // 指定なしだが、相場(600万~)を考慮
  },
  "search_intent_summary": "東京のReactフロントエンド案件（正社員/フリーランス）"
}
```

#### Stage 2: 候補生成 (Handoff to Grounding)

**Input (from Stage 1)**: 上記のJSONオブジェクト

**Action**: AIがこのJSONを解釈し、Google検索クエリを作成

**Generated Query**:
`"React" "求人" "案件" 東京 (正社員 OR フリーランス) site:green-japan.com OR site:indeed.com OR site:findy-code.io`

**Result**: このクエリでGoogle検索が実行され、実際の求人ページがHitする。
```

---

### Stage 2: 候補生成（Google Search Grounding）

#### 目的
AI が最適な「検索クエリ」を生成し、Google検索機能（Grounding）を通じてWeb上のあらゆる求人ページから情報を取得する。
これにより、特定の求人サイトに依存することなく、Indeed、Green、Wantedly、企業の採用ページなど、Web全体の情報を網羅的に探索できる。

#### プロンプト戦略

```typescript
const prompt = `
あなたは優秀なリクルーターです。より多くの適切な求人を見つけるために、Google検索で使用する最適なクエリを作成してください。

ユーザーの検索意図:
${JSON.stringify(intent)}

要件:
1. ユーザーの意図（職種、スキル、勤務地、年収）を反映すること
2. "求人"、"採用"、"募集" などのキーワードを含めること
3. 信頼できる求人サイト（Indeed, Green, Wantedly等）や企業の採用ページがヒットするようにすること
4. 検索クエリは1つだけ出力すること

出力例:
React エンジニア 東京 年収800万 site:green-japan.com OR site:indeed.com OR site:wantedly.com OR "採用"
`;
```

#### 実装例（Google Grounding）

```typescript
async function generateCandidatesWithGrounding(intent: SearchIntent): Promise<Job[]> {
  // 1. 検索クエリの生成
  const queryGenResponse = await gemini.generateContent(buildQueryPrompt(intent));
  const searchQuery = queryGenResponse.text().trim();

  // 2. Google検索機能（Grounding）を使って検索実行
  // ※ Gemini API の標準機能として提供されている "Tools" を使用します。
  // ※ これにより、Geminiが自動的にGoogle検索を行い、その結果を含めて回答を生成します。
  const searchResponse = await gemini.generateContent({
    contents: [{ role: "user", parts: [{ text: `以下のクエリで最新の求人を検索し、結果をリストアップしてください: ${searchQuery}` }] }],
    tools: [{ google_search: {} }] // Google Search Grounding を有効化
  });
  
  // 3. 検索結果から求人情報を抽出
  // Groundingのレスポンスには検索結果のメタデータ（タイトル、URL、スニペット）が含まれる
  const candidates = extractJobsFromGroundingResponse(searchResponse);
  
  return candidates;
}
```

---

### Stage 3: 検証・精緻化（Self-Consistency）

#### 目的
同一求人を複数回評価し、多数決により誤判定を除去

#### アルゴリズム

```typescript
async function evaluateWithSelfConsistency(
  job: Job,
  intent: SearchIntent
): Promise<{ isMatch: boolean; confidence: number; score: number }> {
  
  // 同じ質問を異なる表現で3回投げる
  const prompts = [
    buildEvaluationPrompt1(job, intent),
    buildEvaluationPrompt2(job, intent),
    buildEvaluationPrompt3(job, intent)
  ];

  const results = await Promise.all(
    prompts.map(async (prompt) => {
      const response = await gemini.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      });
      
      const text = response.text();
      const score = extractScore(text); // 0-100
      const isMatch = score >= 70;
      
      return { isMatch, score };
    })
  );

  // 多数決
  const matchCount = results.filter(r => r.isMatch).length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / 3;
  
  return {
    isMatch: matchCount >= 2, // 3回中2回以上マッチ
    confidence: (matchCount / 3) * 100, // 67% or 100%
    score: avgScore
  };
}

function buildEvaluationPrompt1(job: Job, intent: SearchIntent): string {
  return `
この求人はユーザーの希望に合っていますか？0-100点で評価してください。

ユーザーの希望:
${JSON.stringify(intent)}

求人情報:
タイトル: ${job.title}
企業: ${job.company}
勤務地: ${job.location}
スキル: ${job.skills.join(', ')}
年収: ${job.salary}

評価:
  `;
}

function buildEvaluationPrompt2(job: Job, intent: SearchIntent): string {
  return `
以下の求人とユーザー要望のマッチ度を判定してください。

必須条件: ${intent.must_have.join(', ')}
希望条件: ${intent.nice_to_have.join(', ')}

求人: ${job.title} @ ${job.company}

マッチ度 (0-100):
  `;
}

function buildEvaluationPrompt3(job: Job, intent: SearchIntent): string {
  return `
求人の適合性を評価してください。

チェック項目:
1. 必須スキル: ${intent.must_have}
2. 勤務地: ${intent.explicit_conditions.locations}
3. 年収: ${intent.implicit_conditions.min_salary}万以上

求人データ:
${JSON.stringify(job)}

総合評価 (0-100):
  `;
}
```

---

### Stage 4: 企業評価（Multi-AI 統合）

#### 目的
複数 AI で多角的に企業を評価し、偏りを減らす

#### 実装例

```typescript
async function evaluateCompany(
  companyName: string,
  intent: SearchIntent
): Promise<CompanyEvaluation> {
  
  // 並列で Gemini と Claude に評価を依頼
  const [geminiEval, claudeEval] = await Promise.all([
    evaluateWithGemini(companyName, intent),
    evaluateWithClaude(companyName, intent)
  ]);

  // 統合
  return {
    technical_score: geminiEval.technical_score,
    culture_score: claudeEval.culture_score,
    overall_score: (geminiEval.technical_score + claudeEval.culture_score) / 2,
    summary: `${geminiEval.summary}\n\n${claudeEval.summary}`,
    sources: [...geminiEval.sources, ...claudeEval.sources]
  };
}

async function evaluateWithGemini(
  companyName: string,
  intent: SearchIntent
): Promise<Partial<CompanyEvaluation>> {
  const prompt = `
企業「${companyName}」について、以下の観点で評価してください:

1. 技術力（使用技術、開発プロセス、エンジニア文化）
2. 成長性（事業の将来性、組織の拡大）

ユーザーは「${JSON.stringify(intent)}」という条件で探しています。

評価結果をJSON形式で出力してください:
{
  "technical_score": 0-100,
  "summary": "...",
  "sources": [...]
}
  `;

  const response = await gemini.generateContent(prompt);
  return JSON.parse(extractJSON(response.text()));
}

async function evaluateWithClaude(
  companyName: string,
  intent: SearchIntent
): Promise<Partial<CompanyEvaluation>> {
  const prompt = `
企業「${companyName}」について、以下の観点で評価してください:

1. ワークライフバランス（残業時間、休暇取得率）
2. 企業文化（組織の雰囲気、コミュニケーション）

ユーザーは「${JSON.stringify(intent)}」という条件で探しています。

評価結果をJSON形式で出力してください:
{
  "culture_score": 0-100,
  "summary": "...",
  "sources": [...]
}
  `;

  const response = await claude.generateContent(prompt);
  return JSON.parse(extractJSON(response.text()));
}
```

---

## 検索履歴の保存

従来通り、`search_histories` テーブルに保存するが、保存内容を拡張:

```typescript
{
  user_id: "uuid",
  query: "東京でReactの求人",
  interpretation: {
    explicit_conditions: {...},
    implicit_conditions: {...},
    must_have: [...],
    nice_to_have: [...]
  },
  result_count: 10,
  avg_confidence: 89.5, // Self-Consistency の平均信頼度
  created_at: "2024-01-01T00:00:00Z"
}
```

---

## パフォーマンス最適化

### 並列処理戦略
```typescript
// Stage 2 と Stage 3 を並列化
const [candidates, _] = await Promise.all([
  generateCandidates(intent),
  warmupCache() // 企業評価のキャッシュを事前準備
]);

// Self-Consistency の3回評価を並列実行
const evaluations = await Promise.all(
  candidates.map(job => evaluateWithSelfConsistency(job, intent))
);

// Gemini と Claude の評価を並列実行
const companyEvaluations = await Promise.all(
  uniqueCompanies.map(company => evaluateCompany(company, intent))
);
```

### キャッシュ戦略
- 企業評価は24時間キャッシュ（DB or Redis）
- 同一クエリの意図解析は1時間キャッシュ

---

## エラーハンドリング

### AI API エラー
```typescript
try {
  const intent = await parseQueryWithCoT(query);
} catch (error) {
  // フォールバック: 単純なキーワード抽出
  const intent = extractKeywordsSimple(query);
  logError('CoT parsing failed', error);
}
```

### Function Calling エラー
```typescript
try {
  const jobs = await executeFunctionCall(call.name, call.args);
} catch (error) {
  // 該当サイトをスキップして続行
  logError(`Failed to search ${call.name}`, error);
  continue;
}
```

---

## 次のフェーズ

Phase 1 実装完了後、以下を追加予定:
- ベクトル検索（類似求人の発見）
- ユーザーフィードバックによるプロンプト最適化
- リアルタイム通知（新着求人）
