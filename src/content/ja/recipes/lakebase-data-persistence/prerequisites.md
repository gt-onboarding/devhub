開始する前に、以下の Databricks ワークスペース機能が有効になっていることを確認してください。いずれかの確認に失敗した場合は、ワークスペース管理者に機能の有効化を依頼してください。

* **Lakebase Postgres が利用可能であること。** `databricks postgres list-projects --profile <PROFILE>` を実行し、コマンドが成功することを確認します。`not enabled` エラーが返る場合、この ID では Lakebase を利用できません。
* **Databricks Apps が有効であること。** `databricks apps list --profile <PROFILE>` を実行し、コマンドが成功することを確認します (一覧が空でも問題ありません) 。このテンプレートは AppKit app を Databricks Apps に deploy します。
* **プロビジョニング済みの Lakebase project があること。** 先に [Create a Lakebase Project](/templates/lakebase-create-instance) テンプレートを完了し、project の endpoint ホスト、endpoint リソースパス、データベースリソースパス、PostgreSQL データベース名を控えておいてください。