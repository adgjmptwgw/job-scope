# デモモード (Demo Mode)

## 概要

デモモードは`DEMO_MODE=true`で有効化され、Gemini APIを**モック化**してレート制限を回避します。

## 仕組み

### 環境変数による切り替え

`.env.local`に以下を追加するだけでデモモードが有効になります:

```bash
# デモモード有効化
NEXT_PUBLIC_DEMO_MODE=true
```

> **Note:** `NEXT_PUBLIC_`プレフィックスはクライアントサイド（デモバナー表示）とサーバーサイド（APIモック）の両方で参照可能にするためです。

## 使い方

### 1. `.env.local`に環境変数を追加

```bash
# 既存の設定の末尾に追加
NEXT_PUBLIC_DEMO_MODE=true
```

### 2. コンテナを再起動

```bash
docker compose restart
```

## 動作確認

ログに以下が表示されればOK:

```
🎭 [DEMO MODE] Gemini APIモック使用
```

また、ログイン後の画面上部に黄色いデモ通知バナーが表示されます。

## 効果

- ⚡ 検索が数秒で完了（60秒待機なし）
- 🚫 429エラーが発生しない
- 💰 APIコスト削減

## 通常モードに戻す

`.env.local`から以下の行を削除またはコメントアウト:

```bash
# DEMO_MODE=true
# NEXT_PUBLIC_DEMO_MODE=true
```

そしてコンテナを再起動:

```bash
docker compose restart
```

---

**詳細:** [`docs/detail-design/api/02-search-mock.md`](./detail-design/api/02-search-mock.md)
