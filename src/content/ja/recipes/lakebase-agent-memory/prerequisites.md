開始する前に、以下の Databricks ワークスペース機能が有効になっていることを確認してください。いずれかの確認に失敗した場合は、ワークスペース管理者に機能の有効化を依頼してください。

* **Lakebase Postgres が利用可能であること。** `databricks postgres list-projects --profile <PROFILE>` を実行し、コマンドが成功することを確認します (一覧が空でも問題ありません) 。`not enabled` エラーが返る場合、このワークスペースではこの ID で Lakebase を利用できません。
* **Databricks Apps が有効であること。** `databricks apps list --profile <PROFILE>` を実行し、コマンドが成功することを確認します (一覧が空でも問題ありません) 。チャットの永続化レイヤーは、Databricks Apps に deploy された AppKit app 内で動作します。
* **Lakebase を接続済みのスキャフォールディング済み AppKit app があること。** 先に [Create a Lakebase Project](/templates/lakebase-create-instance) と [Lakebase Data Persistence](/templates/lakebase-data-persistence) の templates を完了してください。このテンプレートでは、その setup の上にチャット用テーブルを追加します。