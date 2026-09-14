このテンプレートは、Node.js プロセスから Lakebase Postgres の認証情報を取得してキャッシュします。開始前に、Databricks ワークスペースで次の機能が有効になっていることを確認してください。

* **Lakebase Postgres が利用可能であること。** `databricks postgres list-projects --profile <PROFILE>` を実行し、コマンドが成功することを確認します。`not enabled` エラーが出る場合、この ID では Lakebase を利用できません。
* **プロビジョニング済みの Lakebase project があること。** 先に [Create a Lakebase Project](/templates/lakebase-create-instance) テンプレートを完了し、認証情報 API に渡す `LAKEBASE_ENDPOINT` のリソースパスを用意しておきます。
* **環境変数管理の setup が済んでいること。** 先に [Lakebase Env Management for Off-Platform Apps](/templates/lakebase-off-platform-env-management) テンプレートを完了してください。このテンプレートは検証済みの `env` モジュールをインポートし、`DATABRICKS_HOST`、`LAKEBASE_ENDPOINT`、および `DATABRICKS_TOKEN` または `DATABRICKS_CLIENT_ID` + `DATABRICKS_CLIENT_SECRET` のいずれかが設定されていることを前提とします。