このテンプレートは、既存のシングルエージェント Genie アプリを、複数の Genie Agents を切り替えられるようにアップグレードします。開始前に、以下の Databricks ワークスペース機能が有効になっていることを確認してください。いずれかの項目を満たしていない場合は、ワークスペース管理者に機能の有効化を依頼してください。

* **AI/BI Genie が有効になっていること。** `databricks genie list-spaces --profile <PROFILE>` を実行し、コマンドが成功することを確認します。
* **2 つ以上の Genie Agents が構成されていること。** 上記の一覧で、少なくとも 2 つの Genie Agents (セレクターに表示したいエントリごとに 1 つ) が返される必要があります。足りない場合は、Databricks UI の **AI/BI Genie** で Genie Agents を追加作成してください。
* **Databricks Apps が有効になっていること。** `databricks apps list --profile <PROFILE>` を実行し、コマンドが成功することを確認します。
* **Genie 機能を含むスキャフォールディング済みの AppKit app があること。** 先に [Genie Conversational Analytics](/templates/genie-conversational-analytics) テンプレートを完了してください。このテンプレートで扱うのは 1 つの Genie Agent から複数への移行のみで、初期の Genie の接続設定は対象外です。