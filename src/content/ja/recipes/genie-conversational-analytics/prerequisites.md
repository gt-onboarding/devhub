開始する前に、以下の Databricks ワークスペース機能が有効になっていることを確認してください。いずれかの確認に失敗した場合は、ワークスペース管理者に機能の有効化を依頼してください。

* **AI/BI Genie が有効であること。** `databricks genie list-spaces --profile <PROFILE>` を実行し、コマンドが成功することを確認します。`not found` や権限エラーが返る場合、この ID では Genie を利用できません。
* **Genie Agent が 1 つ以上構成されていること。** 上記のコマンドが space を 1 つ以上返す必要があります。その `space_id` を以下で使用します。存在しない場合は、Databricks ワークスペースを開いて **AI/BI Genie** に移動し、クエリ対象にしたいデータテーブルへ接続された space を作成してください。
* **Databricks Apps が有効であること。** `databricks apps list --profile <PROFILE>` を実行し、コマンドが成功することを確認します (リストが空でも問題ありません) 。テンプレートは、Genie チャット UI をホストする AppKit app を deploy します。