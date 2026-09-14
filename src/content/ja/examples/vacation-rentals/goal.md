このテンプレートは、バケーションレンタル・プラットフォーム (「Wanderbricks」) の社内オペレーションコンソールのサンプルです。オペレーターは、目的地別の売上パフォーマンスを確認し、予約ごとのフラグとエージェントのメモを見ながら予約キューを処理し、埋め込み型の Genie チャットパネルから自然言語でビジネスに関する質問ができます。

### データフロー \{#data-flow\}

このアプリは、単一の React UI の背後で 4 つの Databricks プリミティブを組み合わせています。

1. **SQL Warehouse** は、投入済みの `samples.wanderbricks.{bookings,properties,destinations,reviews}` テーブルに対して分析クエリ (目的地別の売上、個別予約の詳細) を実行します。クエリは `config/queries/*.sql` に定義され、AppKit の `analytics` plugin を通じて実行されます。
2. **Lakebase Postgres** は、オペレーターが管理する状態を `app.booking_flags` および `app.booking_notes` テーブルに保存します。Express サーバーは起動時にスキーマとテーブルを作成し、予約へのフラグ付けやエージェントによるメモ追加のための CRUD ルートを公開します。
3. **Genie Agent** (「Wanderbricks」) は、予約・物件・目的地の各テーブルを対象に構成されています。AppKit の `genie` plugin がチャットパネルを埋め込むため、ユーザーは支出、稼働率、評価に関する質問を自然言語で行えます。
4. **Databricks App** がこれらを統合します。Express + AppKit サーバーと Vite/React/Tailwind クライアントで構成され、SQL warehouse、Genie Agent、Lakebase データベースをアプリのリソースとして宣言する Declarative Automation Bundle (旧 Databricks Asset Bundle) 経由で deploy されます。

### カスタマイズすべき箇所 \{#what-to-adapt\}

セットアップ、環境変数、バンドルの deploy については、リポジトリの **`README.md`** に記載されています。

このテンプレートを自分の用途に合わせるには、次の点を調整します。

* **ソースデータ**: 分析用 SQL ファイルの参照先を `samples.wanderbricks.*` から自分のカタログとスキーマに変更します。予約、物件、目的地のモデルに合わせて結合を調整してください。
* **SQL Warehouse**: `databricks.yml` の `sql_warehouse_id` に、アプリからクエリを実行させたい warehouse を設定します。
* **Lakebase**: `postgres_branch` と `postgres_database` を自分の Lakebase project、branch、データベースに置き換えます。`app.booking_flags` テーブルと `app.booking_notes` テーブルは初回 run 時に自動で作成されます。
* **Genie Agent**: 予約テーブルを対象とする Genie Agent を作成し、`databricks.yml` に `genie_space_id` と `genie_space_name` を設定します。
* **ドメインに応じた表現**: UI はバケーションレンタル(目的地、予約、エージェントのメモ)をテーマにしています。物流、サポート、パートナーシップなど別の業務コンソールに転用する場合は、ルートとコンポーネントの名称を変更し、分析クエリの参照先を差し替えてください。Lakebase + Genie + 分析のスキャフォールディングはそのまま利用できます。