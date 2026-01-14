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
  
  // エラー時はフォールバックせず、呼び出し元に例外を投げる
  if (!response.ok) throw new Error('Query analysis failed');
  
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

### Stage 2: AI求人候補生成（完全無料）

#### 目的
Stage 1で理解したユーザーの意図をもとに、Gemini APIが条件にマッチする求人候補を生成する。
有料のGoogle Search Groundingは使用せず、完全無料で実行する。

#### 入力変換ロジック (Intent to Natural Language Query)
Stage 1 で抽出された構造化データ（JSON）の**全てのフィールド**を自然文に変換し、検索クエリとして使用する。これにより、構造化データの持つ意味を漏らさずAIに伝える。

**変換ルール:**
1. **明示的条件 (Explicit)**
   - `locations`: "勤務地は[A]または[B]"
   - `skills`: "[A]、[B]を使用する"
   - `min_salary`: "年収[X]万円以上"

2. **暗黙的条件 (Implicit)**
   - `role`: "職種は[Role]"
   - `employment_type`: "雇用形態は[A]または[B]" (例: 正社員、フリーランス)
   - `company_size`: "企業規模は[A]または[B]" (例: スタートアップ)
   - `must_have`: "[A]、[B]" (必須条件の羅列)
   - `nice_to_have`: "できれば[A]、[B]" (歓迎条件)

3. **除外条件 (Exclude)**
   - `exclude`: "ただし[A]、[B]は除外"

**生成されるクエリ例:**
> 「勤務地は東京都または京都府、Reactを使用する、年収800万円以上、職種はフロントエンドエンジニア、雇用形態は正社員、できればフルリモート、副業可、ただしSESは除外という条件で求人を探しています」

#### プロンプト戦略

```typescript
const prompt = `
あなたは求人検索の専門家です。以下の条件に合う日本のIT/Web系求人を生成してください。

【検索条件】
${searchQuery}

【指示】
1. 条件にマッチする求人を生成してください
2. 以下のJSON形式で**10件**出力してください
3. 架空の求人で構いませんが、現実にありそうなリアルな内容にしてください

\`\`\`json
{
  "jobs": [
    {
      "title": "職種名",
      "company": "企業名",
      "location": "勤務地",
      "salary_min": 年収下限(数値),
      "salary_max": 年収上限(数値),
      "skills": ["必要スキル"],
      "source_url": "求人ページのURL（ダミー可）",
      "description": "求人の魅力的な要約"
    }
  ]
}
\`\`\`
`;
```

#### 実装例（AI生成）

```typescript
async function generateCandidatesWithAI(intent: SearchIntent): Promise<Job[]> {
  // 1. 検索意図全体を自然文に変換（全フィールド活用）
  const searchQuery = buildIntegratedSearchQuery(intent);

  // 2. Geminiに求人生成を依頼（モデル: gemini-2.0-flash）
  const searchResponse = await gemini.generateContent({
    contents: [{ role: "user", parts: [{ text: buildJobGenerationPrompt(searchQuery) }] }],
    generationConfig: {
      temperature: 0.4,  // 少し創造性を持たせて多様な求人を出す
      maxOutputTokens: 8192 // 10件分のJSONを出力するために十分な量を確保
    }
  });
  
  // 3. JSONレスポンスをパース
  const candidates = parseJobCandidates(searchResponse);
  
  return candidates;
}
```

---

---

### Stage 3+4: 統合検証（Self-Consistency + 企業評価）

#### 目的
求人内容と企業評価を統合的に判断し、同じ条件で3回評価して多数決で信頼性を確保

#### アルゴリズム

```typescript
async function evaluateJobsWithCompanies(
  jobs: Job[],
  intent: SearchIntent
): Promise<ValidatedJob[]> {
  
  const validatedJobs: ValidatedJob[] = [];
  
  for (const job of jobs) {
    // 同じプロンプトを3回実行（Self-Consistency）
    const prompt = buildIntegratedEvaluationPrompt(job, intent);
    
    const evaluations = await Promise.all([
      gemini.generateContent(prompt, { temperature: 0.5 }),
      gemini.generateContent(prompt, { temperature: 0.5 }),
      gemini.generateContent(prompt, { temperature: 0.5 })
    ]);
    
    // 各評価から結果を抽出
    const results = evaluations.map(e => parseEvaluationResult(e));
    
    // 多数決: 3回中2回以上「recommend: true」なら採用
    const recommendCount = results.filter(r => r.recommend).length;
    
    if (recommendCount >= 2) {
      validatedJobs.push({
        ...job,
        job_match_score: average(results.map(r => r.job_match_score)),
        company_evaluation: mergeCompanyEvaluations(results),
        overall_score: average(results.map(r => r.overall_score)),
        confidence: recommendCount === 3 ? 100 : 67
      });
    }
  }
  
  return validatedJobs;
}
```

#### 統合プロンプト例

```typescript
function buildIntegratedEvaluationPrompt(job: Job, intent: SearchIntent): string {
  // ユーザー関心事項を抽出
  const concerns = extractUserConcerns(intent);
  
  return `
この求人を、企業の評判も含めて総合的に評価してください。

【ユーザーの検索意図】
${intent.search_intent_summary}

【ユーザーの関心事項】
${concerns.join(', ')}

【求人情報】
企業: ${job.company.name}
職種: ${job.title}
スキル: ${job.skills.join(', ')}
年収: ${job.salary}
勤務地: ${job.location}

【評価項目】
1. 求人内容がユーザーの条件に合致しているか（0-100）
2. 企業がユーザーの関心事項について良好か（0-100）
3. 総合的に推薦できるか（true/false）

【出力形式】
JSON形式で出力してください。
{
  "job_match_score": 85,
  "company_concerns": {
    "残業時間": { "score": 80, "summary": "..." },
    "チーム雰囲気": { "score": 90, "summary": "..." }
  },
  "overall_score": 84,
  "recommend": true
}

【出力制約 - 厳守】
- JSONのみを出力してください
- コードブロックの囲いは不要です
- 説明文、前置き、後置きは一切不要です
  `;
}
```

#### 企業評価の統合

```typescript
function mergeCompanyEvaluations(results: EvaluationResult[]): CompanyEvaluation {
  const allConcerns: Record<string, ConcernScore[]> = {};
  
  // 各評価結果から関心事項を集約
  results.forEach(result => {
    Object.entries(result.company_concerns).forEach(([concern, score]) => {
      if (!allConcerns[concern]) allConcerns[concern] = [];
      allConcerns[concern].push(score);
    });
  });
  
  // 平均値を算出
  const concerns: Record<string, ConcernScore> = {};
  Object.entries(allConcerns).forEach(([concern, scores]) => {
    concerns[concern] = {
      concern,
      score: Math.round(average(scores.map(s => s.score))),
      summary: scores[0].summary, // 代表値
      sources: [...new Set(scores.flatMap(s => s.sources || []))]
    };
  });
  
  return {
    concerns,
    overall_score: Math.round(average(results.map(r => r.overall_score)))
  };
}
```

#### 今回の統合のメリット

1. **API呼び出し回数削減**: 7回 → 5回（28%削減）
2. **総合的なSelf-Consistency**: 求人内容と企業評価を一緒に検証
3. **精度向上**: 企業評価も含めた多数決で信頼性が高まる
4. **自然な判断**: 「求人は良いが企業がイマイチ」を適切に除外



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

###  Stage 4: 企業評価（ユーザー意図に基づく動的評価）

#### 目的
ユーザーの検索条件から抽出した関心事項について企業を多角的に評価

#### アルゴリズム

```typescript
async function evaluateCompanyForUserConcerns(
  companyName: string,
  intent: SearchIntent
): Promise<CompanyEvaluation> {
  
  // 1. ユーザーの関心事項を抽出
  const concerns = extractUserConcerns(intent);
  // 例: ["残業時間", "チーム雰囲気", "有給取得"]
  
  // 2. 2つの異なる観点から評価（並列実行）
  const [directEval, criticalEval] = await Promise.all([
    evaluateCompanyDirect(companyName, concerns),    // 直接的評価
    evaluateCompanyCritical(companyName, concerns)   // 批判的検証
  ]);
  
  // 3. 結果を統合
  const evaluation = mergeConcernEvaluations(directEval, criticalEval);
  
  return evaluation;
}

// ユーザーの関心事項を抽出
function extractUserConcerns(intent: SearchIntent): string[] {
  const concerns: string[] = [];
  
  if (intent.implicit?.must_have) {
    concerns.push(...intent.implicit.must_have);
  }
  
  if (intent.implicit?.nice_to_have) {
    concerns.push(...intent.implicit.nice_to_have);
  }
  
  // デフォルト（条件がない場合）
  if (concerns.length === 0) {
    concerns.push('技術力', '働きやすさ', '成長機会');
  }
  
  return [...new Set(concerns)].slice(0, 5); // 最大5つ
}
```

#### プロンプト例

**1回目: 直接的評価**
```
企業「SmartHR」について、ユーザーが気にしている以下の観点で評価してください。

【評価項目】
1. 残業時間
2. チーム雰囲気
3. 有給取得

【指示】
- 各項目について0-100点で評価してください
- 評価の根拠となる公開情報があれば明示してください

【出力形式】
JSON形式で出力してください。
{
  "concerns": {
    "残業時間": {
      "score": 85,
      "summary": "平均残業時間は月20時間程度",
      "sources": ["https://..."]
    },
    ...
  }
}

【出力制約 - 厳守】
- JSONのみを出力してください
- コードブロックの囲いは不要です
- 説明文、前置き、後置きは一切不要です
```

**2回目: 批判的検証**
```
企業「SmartHR」について、以下の観点で批判的に検証してください。

【検証項目】
1. 残業時間に関する懸念点や問題がないか
2. チーム雰囲気に関する懸念点や問題がないか
...

【指示】
- 問題がある場合は低いスコアをつけてください
- 問題がない場合は高いスコアをつけてください

【出力形式】
JSON形式で出力してください。

【出力制約 - 厳守】
- JSONのみを出力してください
-  コードブロックの囲いは不要です
- 説明文は一切不要です
```

#### 統合ロジック

```typescript
function mergeConcernEvaluations(
  directEval: Record<string, ConcernScore>,
  criticalEval: Record<string, ConcernScore>
): CompanyEvaluation {
  const concerns: Record<string, ConcernScore> = {};
  let totalScore = 0;
  
  for (const concern in directEval) {
    const directScore = directEval[concern]?.score || 50;
    const criticalScore = criticalEval[concern]?.score || 50;
    const avgScore = Math.round((directScore + criticalScore) / 2);
    
    concerns[concern] = {
      concern,
      score: avgScore,
      summary: directEval[concern]?.summary || '評価情報なし',
      sources: directEval[concern]?.sources || []
    };
    
    totalScore += avgScore;
  }
  
  return {
    concerns,
    overall_score: Object.keys(concerns).length > 0 
      ? Math.round(totalScore / Object.keys(concerns).length)
      : 0
  };
}

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
1日あたりの使用制限やレート制限（429）が発生した場合、以下の戦略をとる。

1. **リトライ**: 指数バックオフを用いて最大 2 回までリトライを実行する。
2. **モデル切り替え**: 優先モデル（gemini-2.0-flash）が失敗した場合、予備モデル（gemini-flash-latest）を試行する。
3. **明示的エラー**: リトライ上限に達した場合、モックデータへのフォールバックは行わず、上位レイヤーにエラーを伝播させる。ユーザーにはフロントエンドでエラーメッセージを表示する。

```typescript
try {
  const intent = await parseQueryWithCoT(query);
} catch (error) {
  // フォールバック（キーワード抽出等）は行わず、システムエラーとして通知
  logError('CoT parsing failed', error);
  throw error; 
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
