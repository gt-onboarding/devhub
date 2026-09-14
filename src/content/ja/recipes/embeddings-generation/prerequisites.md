開始する前に、以下のDatabricksワークスペース機能が有効になっていることを確認してください。確認できない項目があった場合は、ワークスペース管理者に有効化を依頼してください。

* **Model Servingの埋め込みendpoint。** `databricks serving-endpoints list --profile <PROFILE>` を実行し、埋め込みendpointが少なくとも1つ表示されることを確認します (例: `databricks-gte-large-en` や `databricks-bge-large-en`。いずれも1024次元) 。利用できるendpointはワークスペースによって異なります。`DATABRICKS_EMBEDDING_ENDPOINT` に設定する予定のendpoint名を控えておいてください。