永続的なデータ保存に Lakebase Postgres を使用する Databricks App です。スキーマのセットアップと一通りの CRUD API ルートを備え、Databricks Apps プラットフォームへ deploy できます。

### コンポーネント \{#components\}

1. **Create a Lakebase Project** — endpoint とデータベースを備えた managed Postgres の project をプロビジョニングし、接続情報を取得します。
2. **Lakebase Data Persistence** — schema の初期化、CRUD ルート、データアクセスパターンを含めて、Lakebase plugin をアプリに追加します。