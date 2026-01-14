# Gemini APIリトライ戦略

## 概要

AI求人検索では、Gemini APIのレート制限（429エラー）に対応するため、複数モデルのフォールバックとリトライ戦略を実装しています。

---

## 使用モデルと優先順位

以下の順序でGeminiモデルを試行します：

1. **gemini-2.5-flash-lite** - 最軽量・最速（優先）
2. **gemini-2.5-flash** - 標準（フォールバック）

---

## リトライ戦略の詳細

### フロー図

```
開始
  ↓
gemini-2.5-flash-lite を試行
  ↓
成功? → Yes → 結果を返す
  ↓ No (429エラー)
5秒待機 → リトライ (2回目)
  ↓
成功? → Yes → 結果を返す
  ↓ No (429エラー)
10秒待機 → リトライ (3回目)
  ↓
成功? → Yes → 結果を返す
  ↓ No (429エラーまたは他のエラー)
────────────────────────────────
gemini-2.5-flash に切り替え
  ↓
5秒待機 → リトライ (1回目)
  ↓
成功? → Yes → 結果を返す
  ↓ No (429エラー)
10秒待機 → リトライ (2回目)
  ↓
成功? → Yes → 結果を返す
  ↓ No (429エラー)
20秒待機 → リトライ (3回目)
  ↓
成功? → Yes → 結果を返す
  ↓ No (全失敗)
全モデル失敗 → エラーを返す
```

---

## 詳細仕様

### 1. gemini-2.5-flash-lite（優先モデル）

**試行回数**: 最大3回

| 試行 | 待機時間 | 処理 |
|------|---------|------|
| 1回目 | なし | 即座に実行 |
| 2回目 | 5秒 | 429エラー時のみ |
| 3回目 | 10秒 | 429エラー時のみ |

**成功時**: 結果を返して処理終了  
**全失敗時**: `gemini-2.5-flash`に切り替え

---

### 2. gemini-2.5-flash（フォールバック1）

**試行回数**: 最大3回

| 試行 | 待機時間 | 処理 |
|------|---------|------|
| 1回目 | 5秒 | 前モデル失敗後 |
| 2回目 | 10秒 | 429エラー時のみ |
| 3回目 | 20秒 | 429エラー時のみ |

**成功時**: 結果を返して処理終了  
**全失敗時**: エラーを返す

---

## エラーハンドリング

### 429エラー（レート制限）

- 指数バックオフで待機時間を延長（5秒 → 10秒 → 20秒）
- モデルを切り替えて継続試行
- 最大6回（2モデル × 3回）まで試行

### その他のエラー（500, 503, 404など）

- 即座に次のモデルに切り替え
- リトライせずフォールバック

### タイムアウト

- 15秒のタイムアウト設定
- タイムアウト時は次のモデルに切り替え

---

## ログ出力例

### 成功ケース（1回目で成功）

```
[Gemini] Trying model: models/gemini-2.5-flash-lite (attempt 1/3)
✅ 成功
```

### 429エラー → リトライ → 成功

```
[Gemini] Trying model: models/gemini-2.5-flash-lite (attempt 1/3)
⏳ [Gemini] Rate limit (429). 5秒後にリトライ...
[Gemini] Trying model: models/gemini-2.5-flash-lite (attempt 2/3)
✅ 成功
```

### 全モデル試行ケース

```
[Gemini] Trying model: models/gemini-2.5-flash-lite (attempt 1/3)
⏳ [Gemini] Rate limit (429). 5秒後にリトライ...
[Gemini] Trying model: models/gemini-2.5-flash-lite (attempt 2/3)
⏳ [Gemini] Rate limit (429). 10秒後にリトライ...
[Gemini] Trying model: models/gemini-2.5-flash-lite (attempt 3/3)
⏳ [Gemini] Rate limit (429). 20秒後にリトライ...

[Gemini] Trying model: models/gemini-2.5-flash (attempt 3/3)
⏳ [Gemini] Rate limit (429). 20秒後にリトライ...

❗️ 全てのモデルが失敗しました
```

---

## パフォーマンスへの影響

### 最良ケース
- 1回目のリクエストで成功
- 待機時間: 0秒
- 使用モデル: gemini-2.5-flash-lite

### 平均ケース
- 2-3回のリトライで成功
- 待機時間: 5-15秒
- 使用モデル: gemini-2.5-flash-lite

### 最悪ケース
- 6回全て試行
- 待機時間: 合計 60秒（5+10+20+5+10+20）
- 使用モデル: 全て試行

---

## 設定変更

### 環境変数による制御
`IS_GEMINI_FREE=true` を設定すると、無料版として動作し、429エラー時のリトライ待機時間が一律 **60秒** に固定されます。

### リトライ回数の変更

`src/infrastructure/ai/GeminiClient.ts`の以下の行を変更：

```typescript
const maxRetries = 2; // 0-indexedなので、実質3回試行
```

### 待機時間の変更

```typescript
const waitTime = Math.pow(2, attempt) * 5000; // 5秒, 10秒, 20秒...
```

### モデルの追加・削除

```typescript
const models = [
  'models/gemini-2.5-flash-lite',
  'models/gemini-2.5-flash'
];
```

---

## 注意事項

- 無料枠のレート制限を考慮した設定
- 本番環境では、より多くのリトライや長い待機時間が必要な場合がある
- モデルの可用性はGoogleのAPI状況に依存する
