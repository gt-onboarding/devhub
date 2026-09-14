このテンプレートは、`databricks apps init` を使ってゼロから新しい AppKit の Databricks App をスキャフォールディングします。ユーザーが可能な限り最小構成の Databricks App を出発点にしたい場合に使用してください。ここから plugin やルートを追加し、deploy できます。

* **対象ワークスペースで Databricks Apps を deploy する権限。** このテンプレートは最後に `databricks apps deploy` を実行します。ユーザーの ID で Apps が有効になっていない場合、deploy は `PERMISSION_DENIED` で失敗します。
* **PATH 上に Node.js `22+` と `git` があること。** AppKit プロジェクトは Node/TypeScript ベースで、`npm install` は公開レジストリに対して実行されます。
* **アプリ名と説明を決めておくこと。** 名前は小文字とハイフンのみで、26 文字以内にする必要があります。`apps init` を実行する前に、ユーザーに名前と一文の説明を確認してください。