このテンプレートは、Databricksスタック上に本格的な小売在庫管理システムを構築します。店舗マネージャーが在庫状況を monitoring し…

### データフロー \{#data-flow\}

売上・在庫データは Lakebase Postgres からレイクハウスへ流れ、需要予測モデルでエンリッチされた後、リバース同期によってアプリへ戻されます。

1. **OLTP の書き込み**が Lakebase Postgres に書き込まれます (店舗、商品、在庫数、売上トランザクション、補充発注)。
2. **Lakebase Change Data Feed (CDF)** がすべての変更を CDC 履歴テーブル (ブロンズ層) として Unity Catalog に複製します。
3. **Lakeflow Spark 宣言型 pipeline** が CDC 履歴を現在状態のシルバーテーブルと、ゴールドの materialized views (在庫概要、在庫僅少アラート、販売速度) に変換します。
4. **Lakeflow Jobs** がスケジュール実行され、シルバーの売上履歴を読み込み、差し替え可能な需要予測モデルを実行して、30 日間の数量予測と補充推奨を Delta のゴールドテーブルに出力します。
5. **Sync Tables** (リバース同期) がゴールドテーブルを Lakebase に複製し、低レイテンシーな読み取りを可能にします。
6. **Inventory Intelligence App** (Databricks App) が OLTP と同期済みゴールドテーブルの両方から読み取り、dashboard、店舗別ドリルダウン、補充キュー、オプションの Genie 分析を表示します。

### デザイン \{#design\}

このアプリは **美しく洗練されたデザイン** を備えている必要があります。すっきりとしたタイポグラフィ、統一感のある余白、そしてプロフェッショナルな小売らしい佇まいです。基盤には shadcn/ui のコンポーネントを使い、スタイリングはすべて Tailwind で行い、全体にブランドカラーを適用します。dashboard は情報量が多くても雑然として見えないように、補充キューは承認 workflows をストレスなく進められるように仕上げます。

### カスタマイズすべき項目 \{#what-to-adapt\}

プロビジョニング (Unity Catalog schema、Lakebase の REPLICA IDENTITY) 、シード投入、pipeline の deploy、リバース同期、アプリの deploy については、リポジトリのコードと同じ場所にある **`README.md`** に記載しています。

このテンプレートを自分の用途に合わせるには、次の項目を変更します。

* **カタログ**: 各 pipeline の `databricks.yml` にある `catalog` 変数に、自分の Unity Catalog のカタログ名を設定します。
* **Lakebase**: アプリの `databricks.yml` の参照先を、自分の Lakebase project、branch、データベースに変更します。
* **テーブル**: シードスクリプトは、5 店舗・25 商品・90 日分の売上履歴を含む OLTP schema を作成します。シード投入後、`inventory` schema のテーブルをレプリケートするように Change Data Feed を設定します。
* **同期テーブル**: 3 つのリバース同期設定を手動で作成します (テーブルの対応関係の詳細は README を参照してください) 。
* **予測モデル**: 需要予測 pipeline の `forecast_model` 変数に、`weighted_moving_average` (デフォルト) 、`exponential_smoothing`、`prophet`、`model_serving` のいずれかを設定します。
* **Genie Agent**: ゴールドテーブル上に Genie Agent を作成し、アプリバンドルの `genie_space_id` を設定して Analytics タブを有効化します。