Databricks Apps プラットフォームの外部 (AWS、Vercel、Netlify など) でホストされているアプリから Lakebase Postgres への接続です。このアプリは、可搬性のある環境設定、資格情報を自動更新するトークン管理、型安全なデータベースアクセスのための Drizzle ORM を使用します。

### コンポーネント \{#components\}

1. **Lakebase 環境管理** — Lakebase の接続値を安全に扱うため、Zod で検証する環境設定をセットアップします。
2. **Lakebase トークン管理** — Lakebase Postgres の認証情報について、トークンの取得・キャッシュ・自動リフレッシュを実装します。
3. **Drizzle ORM と Lakebase** — 認証情報の自動リフレッシュとマイグレーションに対応した Drizzle ORM プールを設定します。