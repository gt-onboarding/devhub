このテンプレートは、Databricks App Platform外で動作するアプリからLakebaseに接続するために必要な環境変数を収集します。開始前に、以下のDatabricksワークスペース機能が有効になっていることを確認してください。

* **Lakebase Postgresが利用可能であること。** `databricks postgres list-projects --profile <PROFILE>` を実行し、コマンドが成功することを確認します。`not enabled` エラーが返る場合、このIDではLakebaseを利用できません。
* **プロビジョニング済みのLakebaseプロジェクトがあること。** 先に [Create a Lakebase Project](/templates/lakebase-create-instance) テンプレートを完了してください。その branch、endpoint、データベースから接続情報を読み取ります。
* **本番環境向けのマシン間OAuth (任意) 。** サービスプリンシパルで本番運用する予定がある場合は、そのサービスプリンシパルの `DATABRICKS_CLIENT_ID` / `DATABRICKS_CLIENT_SECRET` を用意しておきます。ローカル開発では、`databricks auth token --profile <PROFILE>` で取得したワークスペーストークンで十分です。