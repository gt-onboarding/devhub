開始する前に、以下のDatabricksワークスペースの機能が有効になっていることを確認してください。いずれかの確認に失敗した場合は、ワークスペース管理者に機能の有効化を依頼してください。

* **ワークスペースでLakebase Postgresが利用可能であること。** `databricks postgres list-projects --profile <PROFILE>` を実行し、コマンドが成功することを確認します (一覧が空でも問題ありません。これから最初のprojectを作成するためです) 。`not enabled` や権限エラーが返る場合、そのアイデンティティではLakebaseを利用できません。