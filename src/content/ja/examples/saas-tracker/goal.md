このテンプレートは、Databricks 上に構築するシンプルな社内 CRUD ツールの例です。SaaS サブスクリプション管理ツールとして、チームが利用しているツール、各サブスクリプションの所有者、コスト、更新時期を記録します。Genie Agent を使えば、サブスクリプションデータをセルフサービスで分析できます。

### データフロー \{#data-flow\}

すべてのサブスクリプションデータは単一の Lakebase Postgres テーブルに保存され、アプリへ直接提供されます。

1. **Lakebase Postgres** は、`saas_tracker.subscriptions` テーブルに名称、ベンダー、コスト、請求サイクル、所有者、ステータス、更新日を保存します。
2. **SaaS Tracker App** (Databricks App) は、Lakebase をバックエンドとする Express API ルート経由でサブスクリプションを読み書きします。
3. **SQL warehouse のクエリ**が分析ダッシュボード (支出の概要、カテゴリ別支出) を支えます。
4. subscriptions テーブル上に構成した **Genie Agent** を使うと、支出、所有者、更新について自然言語で質問できます。

### カスタマイズすべき箇所 \{#what-to-adapt\}

セットアップとプロビジョニングについては、リポジトリの **`README.md`** を参照してください。

このテンプレートを自分の用途に合わせるには、次の点を変更します。

* **Lakebase**: アプリの `databricks.yml` の参照先を、自分の Lakebase project、branch、データベースに変更します。
* **SQL Warehouse**: 分析クエリ用の warehouse ID を設定します。
* **Genie Agent**: `saas_tracker.subscriptions` テーブルに対する Genie Agent を作成し、space ID を設定します。
* **カテゴリー**: サーバールートとフォームコンポーネント内のカテゴリー一覧を、自組織の部門に合わせて調整します。
* **シードデータ**: シードスクリプトは、実際の利用に近いデモ用サブスクリプションを 18 件作成します。自分のデータに置き換えるか、アプリの追加フォームを使用してください。