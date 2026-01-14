# APIロギング仕様書

## 概要

本プロジェクトでは、デバッグとモニタリングを容易にするため、**全てのAPIエンドポイント**にリクエストログを出力しています。

特に**AI求人検索API** (`/api/search/cot`) については、各ステージの入出力結果を詳細にロギングしています。

---

## 全APIの共通ロギング仕様

### 基本フォーマット

全てのAPIエンドポイントは、リクエスト受信時に以下の情報をログ出力します:

```typescript
console.log('\n📡 API REQUEST: [メソッド] [パス]');
console.log('⏰ timestamp:', new Date().toISOString());
console.log('📝 params:', JSON.stringify({ /* リクエストパラメータの実際の値 */ }, null, 2));
```

**例:**
```
📡 API REQUEST: GET /api/jobs
⏰ timestamp: 2026-01-12T12:00:00.000Z
📝 params: {
  "query": "残業が少ない",
  "locations": ["東京"],
  "skills": ["React", "TypeScript"],
  "minSalary": "8000000",
  "offset": 0,
  "limit": 20
}
```

### 認証エラー時

```typescript
console.log('❌ auth_error:', error.message);
```

### バリデーションエラー時

```typescript
console.log('❌ validation_error:', '詳細');
```

---

## API別ロギング詳細

### 1. GET /api/jobs

通常の求人検索API。

**ログ出力内容:**
```
📡 API REQUEST: GET /api/jobs
⏰ timestamp: 2026-01-12T12:00:00.000Z
📝 params: {
  "query": "残業が少ない",
  "locations": ["東京", "大阪"],
  "skills": ["React", "TypeScript"],
  "minSalary": "8000000",
  "offset": 0,
  "limit": 20
}
```

---

### 2. GET /api/search/cot

**AI求人検索API（特別扱い）**

このAPIは4段階のAI処理を実行するため、各ステージの入出力を詳細にロギングします。

#### リクエスト受信時

```
🔴🔴🔴 API REQUEST RECEIVED: /api/search/cot 🔴🔴🔴
⏰ timestamp: 2026-01-12T12:00:00.000Z
📏 query_length: 120

📝 integrated_query:
────────────────────────────────────────
残業が少ない、勤務地は東京、React、TypeScriptを使用する、年収800万円以上という条件で求人を探しています
────────────────────────────────────────

🚀 ===== AI求人検索開始 =====
⏰ start_time: 2026-01-12T12:00:00.000Z
================================
```

#### Stage 1: Chain-of-Thought 意図理解

```
========================================
🧠 [Stage 1] Chain-of-Thought 意図理解
========================================
📝 入力クエリ: 残業が少ない、勤務地は東京、React、TypeScriptを使用する
🔄 Gemini API を呼び出し中...
[Gemini] Trying model: models/gemini-2.0-flash (attempt 1/3)

📤 Gemini 生テキスト出力:
---
{
  "explicit": {
    "locations": ["東京"],
    "skills": ["React", "TypeScript"],
    "min_salary": null
  },
  "implicit": {
    "role": "Frontend Engineer",
    "must_have": ["ワークライフバランス"]
  },
  "search_intent_summary": "東京でReact、TypeScriptを使ったワークライフバランスの良い求人"
}
---

✅ パース結果:
{
  "explicit": { ... },
  "implicit": { ... },
  "search_intent_summary": "..."
}
========================================
```

**ポイント:**
- Gemini APIの生レスポンス（JSON解析前）を表示
- パース後の構造化データを表示
- エラー時は詳細なエラーメッセージ
- 空レスポンス `{}` の場合は警告を出力

#### Stage 2: Google Search Grounding

```
========================================
🔍 [Stage 2] Google Search Grounding
========================================
📝 検索クエリ: "React" "TypeScript" 求人 東京 site:green-japan.com OR site:indeed.com
🔄 Gemini API (with Grounding) を呼び出し中...

📤 Gemini 出力:
---
(最初の500文字)...
---

🌐 グラウンディング情報:
Web検索クエリ: ["React TypeScript 東京 求人"]
参照チャンク数: 10

✅ 5件の求人を取得 (Grounding)
========================================
```

#### Stage 3: Self-Consistency 検証

```
========================================
✓ [Stage 3] Self-Consistency 検証
========================================
📊 候補数: 5
🎯 意図: 東京でReact、TypeScriptを使ったワークライフバランスの良い求人

🔍 求人評価中: Frontend Engineer @ Tech Corp
  => 結果: 一致 (スコア: 85, 一致数: 3/3)

✅ 検証完了: 3/5 件が適合
========================================
```

#### Stage 4: 企業評価

```
========================================
🏢 [Stage 4] ユーザー意図に基づく企業評価
========================================
📊 対象企業: Tech Corp, Startup Inc.
🎯 評価する関心事項: ワークライフバランス, 技術力, 成長機会

🔍 企業評価中: Tech Corp
  ✅ 評価完了 (総合スコア: 85)

✅ 企業評価完了: 2/2 件
========================================
```

---

### 3. GET /api/history

検索履歴取得API。

**ログ出力内容:**
```
📡 API REQUEST: GET /api/history
⏰ timestamp: 2026-01-12T12:00:00.000Z
👤 user_id: 550e8400-e29b-41d4-a716-446655440000
```

---

### 4. POST /api/history

検索履歴保存API。

**ログ出力内容:**
```
📡 API REQUEST: POST /api/history
⏰ timestamp: 2026-01-12T12:00:00.000Z
👤 user_id: 550e8400-e29b-41d4-a716-446655440000
📝 summary: 東京、React、TypeScript、800万円以上
🔍 conditions: {
  "naturalLanguageSearch": "残業が少ない",
  "selectedTechTags": ["React", "TypeScript"],
  "selectedLocationTags": ["東京"],
  "minSalary": 800,
  "selectedWorkStyles": ["リモート"],
  "excludeConditions": "SES"
}
```

---

### 5. GET /api/favorites

お気に入り一覧取得API。

**ログ出力内容:**
```
📡 API REQUEST: GET /api/favorites
⏰ timestamp: 2026-01-12T12:00:00.000Z
👤 user_id: 550e8400-e29b-41d4-a716-446655440000
```

---

### 6. POST /api/jobs/[id]/favorite

お気に入り追加API。

**ログ出力内容:**
```
📡 API REQUEST: POST /api/jobs/[id]/favorite
⏰ timestamp: 2026-01-12T12:00:00.000Z
📝 job_id: 123e4567-e89b-12d3-a456-426614174000
👤 user_id: 550e8400-e29b-41d4-a716-446655440000
```

---

### 7. DELETE /api/jobs/[id]/favorite

お気に入り削除API。

**ログ出力内容:**
```
📡 API REQUEST: DELETE /api/jobs/[id]/favorite
⏰ timestamp: 2026-01-12T12:00:00.000Z
📝 job_id: 123e4567-e89b-12d3-a456-426614174000
👤 user_id: 550e8400-e29b-41d4-a716-446655440000
```

---

## フロントエンド側のロギング

### AI検索リクエスト

ブラウザコンソールには、以下のようにユーザーの入力条件と統合クエリが表示されます:

```
🔍 ========== AI検索リクエスト開始 ==========
📝 入力された検索条件:
  ├─ 自然文検索: 残業が少ない
  ├─ 技術スタック: React, TypeScript
  ├─ 勤務地: 東京
  ├─ 希望年収: 800万円以上
  ├─ 働き方: リモート
  └─ 除外条件: SES

🤖 統合クエリ (AI送信用):
  「残業が少ない、勤務地は東京、React、TypeScriptを使用する、年収800万円以上、働き方はリモート、ただしSESは除外という条件で求人を探しています」
  (文字数: 120 文字)
==========================================
```

---

## ロギングの目的

1. **デバッグの容易化**: 各APIの動作を追跡可能
2. **AI検索の透明性**: 各ステージの入出力を可視化
3. **エラー診断**: 問題箇所を迅速に特定
4. **パフォーマンス監視**: APIの応答時間を計測可能

---

## 注意事項

- 本番環境では、個人情報（ユーザーID等）のログ出力を制限することを推奨
- ログレベルを環境変数で制御する仕組みを導入することを検討
- AI検索のログは詳細なため、ログファイルサイズに注意
