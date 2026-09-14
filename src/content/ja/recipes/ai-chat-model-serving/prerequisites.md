まず、前提となる次のテンプレートを完了してください。

* [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) — Databricks CLI をインストールし、プロファイルで認証します。
* [Query Foundation Model Endpoints](/templates/foundation-models-api) — ワークスペースで Databricks がホストする foundation model のチャット endpoint が公開されていることを確認します。

次に、以下の Databricks ワークスペース機能が有効になっていることを確認してください。いずれかの確認に失敗した場合は、ワークスペース管理者に機能の有効化を依頼してください。

* **Model Serving の OpenAI 互換チャット endpoint。** `databricks serving-endpoints list --profile <PROFILE>` を実行し、OpenAI 互換のチャット endpoint が少なくとも 1 つ表示されることを確認します(例: `databricks-gpt-5-4-mini`、`databricks-meta-llama-3-3-70b-instruct`、`databricks-claude-sonnet-4-6`)。endpoint の提供状況はワークスペースやリージョンによって異なります。`DATABRICKS_ENDPOINT` に設定する予定のものを控えておいてください。
* **Databricks Apps が有効であること。** `databricks apps list --profile <PROFILE>` を実行し、コマンドが成功することを確認します(リストが空でも問題ありません)。permission エラーや `not enabled` エラーが返る場合は、そのワークスペースでこの ID から Apps を利用できない状態です。