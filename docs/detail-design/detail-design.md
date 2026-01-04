# 詳細設計書 (API)

バックエンドAPIの詳細設計は機能ごとに以下の通り分割されている。

## API 一覧

1.  [**認証 API**](./api/01-auth.md) (`POST /api/auth/login`)
2.  [**求人検索 API**](./api/02-search.md) (`GET /api/jobs`)
3.  [**求人詳細 API**](./api/03-jobs.md) (`GET /api/jobs/{id}`)
4.  [**企業実態評価 API**](./api/04-companies.md) (`GET /api/companies/{id}/evaluation`)
