エンドツーエンドの運用データ分析pipelineです。データはOLTPデータベース (Lakebase Postgres) からCDCレプリケーションによってUnity Catalogへ流れ込み、メダリオンアーキテクチャ (bronze/シルバー/ゴールドレイヤー) で変換されて、dashboardや下流の利用者がすぐに使える状態になります。

### コンポーネント \{#components\}

1. **Unity Catalog Setup** — 宛先となるカタログとschemaに対して、外部S3ストレージを使用するUnity Catalogを構成します。
2. **Create a Lakebase Project** — OLTPソースとなるmanaged Postgresのprojectをプロビジョニングします。
3. **Lakebase Change Data Feed (CDF)** — LakebaseのテーブルからUnity CatalogのDelta履歴テーブルへの継続的なレプリケーションを有効にします。
4. **メダリオンアーキテクチャ from CDC** — Lakeflow Spark Declarative Pipelinesを使用して、CDC履歴テーブルからシルバー層 (現在の状態) とゴールド層 (分析用) を構築します。