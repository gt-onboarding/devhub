完了すると、次のものが得られます。

* 上流の Lakebase Change Data Feed 履歴テーブルが提供するブロンズレイヤー (このレシピの入力) 
* エンティティごとに重複を排除し、現在の状態を表す materialized views を備えたシルバーレイヤー
* ビジネス集計とメトリクスを materialized views として提供するゴールドレイヤー
* シルバーレイヤーとゴールドレイヤーを増分的に refresh する、スケジュール実行の Lakeflow Spark 宣言型 pipeline
* SQL、Spark、BI ツール、Genie から Unity Catalog テーブルとしてクエリできるすべてのレイヤー