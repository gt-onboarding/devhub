このテンプレートは、Databricks の開発者スタック全体を 1 つの運用データアプリケーションにまとめたものです。すべての顧客メッセージを LLM が自動的にトリアージする AI 搭載のサポートコンソールで、サポート担当者は専用に構築された社内ツール上で提案を確認し、承認または上書きできます。

### データフロー \{#data-flow\}

顧客とのやり取りは、アプリケーションの OLTP データベース (Lakebase Postgres) から CDC を経由してレイクハウスへ流れ、AI エージェントによって拡充され、リバース同期によってサポートコンソールへ戻されます。

1. **OLTP の書き込み**が Lakebase Postgres に格納されます (ユーザー、注文、サポートケース、メッセージ) 。
2. **Lakebase Change Data Feed (CDF)** が、すべての変更を CDC 履歴テーブル (ブロンズ層) として Unity Catalog に複製します。
3. **Lakeflow Spark Declarative Pipeline** が CDC 履歴を、現在状態を表すシルバーテーブルと分析用のゴールド materialized views (日次収益、サポート概要、ユーザープロファイル、ケースコンテキスト) に変換します。
4. **Lakeflow Jobs** が毎分実行され、未回答のメッセージを検出し、ゴールドテーブルから充実したコンテキストを構築し、Model Serving endpoint 経由で LLM を呼び出して、回答案を Delta テーブルにマージします。
5. **Synced tables** (リバース同期) がゴールドテーブルを Lakebase に複製し、低レイテンシの読み取りを可能にします。
6. **サポートコンソール** (Databricks App) が OLTP と同期済みゴールドテーブルの両方から読み取り、ケース、AI による提案、分析情報を表示します。

### カスタマイズすべき項目 \{#what-to-adapt\}

プロビジョニング (手動手順と SQL) 、シード投入、pipeline の deploy、リバース同期、アプリの deploy については、コードとあわせてリポジトリの **`README.md`** に記載されています。

このテンプレートを自分用にカスタマイズするには、次の作業を行います。

* **Catalog**: 各 pipeline の `databricks.yml` にある `catalog` 変数に、使用する Unity Catalog のカタログ名を設定します。
* **Lakebase**: アプリの `databricks.yml` の参照先を、自分の Lakebase project、branch、データベースに変更します。
* **テーブル**: シードスクリプトが OLTP スキーマを作成します。シード投入後、`public` スキーマのテーブルがレプリケートされるように Change Data Feed を設定します。
* **同期テーブル**: 4 つのリバース同期設定を手動で作成します (テーブルの対応関係は README を参照してください) 。
* **Serving Endpoint**: `endpoint` 変数に、使用したいモデルサービング endpoint を設定します。
* **Genie Agent**: ゴールドテーブル上に Genie Agent を作成し、アプリバンドルに `genie_space_id` を設定します。