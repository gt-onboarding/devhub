開始する前に、次の Databricks ワークスペース機能が有効になっていることを確認してください。いずれかの確認に失敗した場合は、ワークスペース管理者に機能の有効化を依頼してください。

* **Lakebase Postgres が利用可能であること。** `databricks postgres list-projects --profile <PROFILE>` を実行し、コマンドが成功することを確認します。`not enabled` エラーが返る場合、この ID では Lakebase を利用できません。
* **プロビジョニング済みの Lakebase project があること。** まず [Create a Lakebase Project](/templates/lakebase-create-instance) テンプレートを完了してください。その primary endpoint に対して `vector` 拡張を有効化します。
* **CLI で `databricks psql` が利用できること。** `databricks psql --help` を実行し、サブコマンドが存在することを確認します。存在しない場合は Databricks CLI をアップグレードしてください ([Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) を参照) 。