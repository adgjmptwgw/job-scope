FROM node:20-alpine AS base

# 必要時のみ依存関係をインストール
FROM base AS deps
# https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine で、なぜ libc6-compat が必要なのかを確認してください。
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 推奨パッケージマネージャーに基づいて依存関係をインストール
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi


# 必要時のみソースコードをリビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.jsは一般的な使用状況に関する完全に匿名なテレメトリデータを収集します。
# 詳細はこちら: https://nextjs.org/telemetry
# ビルド中にテレメトリを無効にする場合は次の行のコメントを解除してください。
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 本番イメージ、全ファイルをコピーしてnextを実行
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# ランタイム中にテレメトリを無効にする場合は次の行のコメントを解除してください。
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# プリレンダリングキャッシュの適切な権限を設定
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 出力トレースを自動的に活用してイメージサイズを削減
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# ホスト名を設定
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
