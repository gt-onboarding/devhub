このテンプレートは、Databricks 上に構築した検索拡張生成 (RAG) チャットアプリの例です。ユーザーの質問を埋め込みベクトルに変換し、Lakebase Postgres の pgvector ストアから類似ドキュメントを取得したうえで、そのコンテキストを Model Serving の呼び出しに組み込み、回答をストリーミングで返します。会話と参照元はチャットごとに Lakebase に永続化されます。

### データフロー \{#data-flow\}

検索とチャットの状態はすべて Lakebase Postgres に保持され、生成には Model Serving を使用します。

1. **シーディング**: 起動時に少数の Wikipedia 記事を取得し、段落単位でチャンクに分割したうえで、各チャンクを foundation-model の埋め込み endpoint (既定では `databricks-gte-large-en`) でベクトル化し、`vector(1024)` カラムを持つ `rag.documents` に行として書き込みます。
2. **ユーザーのターン**: 同じ endpoint でベクトル化されます。サーバーは pgvector によるコサイン類似度検索を実行し、上位 k 件の一致するチャンクを取得します。
3. **コンテキストの注入**: 取得したチャンクはシステムメッセージとして先頭に付加され、ユーザーの会話履歴とともに Model Serving 経由でチャット補完 endpoint (既定では `databricks-gpt-5-4-mini`) へ送信されます。
4. **ストリーミング**: `streamText` が token をクライアントへストリーミングし、その間に `onFinish` コールバックがアシスタントのターンを Lakebase に追記します。
5. **chat history**: ユーザーとアシスタントのすべてのターンが `chat_id` をキーとして `chat.messages` に永続化されるため、会話を再開できます。

### テンプレートのアプローチ \{#template-approach\}

他の templates とは異なり、**このテンプレートは `git clone` ではなく `databricks apps init` 経由で利用することを前提に設計されています**。init フローの動作は次のとおりです。

* Lakebase Postgres の branch 名とデータベースリソース名の入力を求めます。
* Lakebase API を呼び出して `PGHOST`、`PGDATABASE`、`LAKEBASE_ENDPOINT` を自動解決し、ローカルの `.env` に書き込みます。
* Databricks CLI の設定に基づいて `DATABRICKS_CONFIG_PROFILE` または `DATABRICKS_HOST` を書き込みます。
* `--name` で指定した名前で、すぐに実行できる状態のプロジェクトディレクトリを用意します。

これは、[AppKit templates システム](/docs/appkit/v0/development/templates) が DevHub テンプレートをリリースする手段として使えることを実証するものです。仕組みの詳細は、テンプレート内の `appkit.plugins.json` と `.env.tmpl` を参照してください。

### 適応すべき箇所 \{#what-to-adapt\}

setup とプロビジョニングについてはリポジトリの **`README.md`** に記載されています。

このテンプレートを自分の用途に合わせるには、次の点を変更します。

* **Lakebase**: バンドルが参照する Lakebase の project、branch、データベースを自分のものに変更します (init 時に入力を求められます) 。
* **Model Serving endpoint**: 別のチャットモデル (例: `databricks-claude-sonnet-4-6`) を使う場合は `DATABRICKS_ENDPOINT` を上書きします。
* **埋め込み endpoint**: 別の埋め込みモデルを使いたい場合は `DATABRICKS_EMBEDDING_ENDPOINT` を上書きします。その際、`server/lib/rag-store.ts` の `vector(N)` の次元数が一致しているか確認してください。
* **シードデータ**: `server/lib/seed-data.ts` の Wikipedia 記事リストを独自のコーパスに置き換えます。チャンク分割関数は段落境界で分割するため、ソースの構造が異なる場合は適宜調整してください。
* **検索**: 既定の top-k は 5、類似度指標はコサインです。`retrieveSimilar()` で調整できます。