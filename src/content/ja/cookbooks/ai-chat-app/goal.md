Databricks 上で動作するストリーミング AI チャットアプリです。ユーザーがメッセージを送信すると、サーバーは Databricks CLI profile (本番環境ではサービスプリンシパルの token) で認証し、OpenAI 互換プロバイダー経由で foundation-model のサービング endpoint を呼び出して、回答を token 単位でストリーミング返却します。チャットセッションとメッセージは Lakebase Postgres に永続化されるため、ページの refresh や再 deploy 後も会話は失われません。

### 各ステップのつながり \{#how-the-steps-fit-together\}

以下の順序でステップを進めてください。各ステップで具体的な要素を 1 つずつ追加していき、最後には deploy 可能なアプリが完成します。インストール済みの Databricks エージェントスキルが、各ステップの実装パターンを提供します。

1. **Spin Up a Databricks App** — `databricks apps init` で新しい AppKit Databricks App をスキャフォールディングします (上記のメタプロンプトでは、[Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) によって CLI profile の検証がすでに済んでいます) 。
2. **Query Foundation Model Endpoints** — チャットモデル (例: `databricks-gpt-5-4-mini`) を選び、ワークスペースの `/serving-endpoints` をベース URL として `createOpenAI()` を設定します。
3. **Streaming AI Chat with Model Serving** — `streamText()` を使った `/api/chat` ルートと、`TextStreamChatTransport` を利用する `useChat` の UI を追加します。
4. **Create a Lakebase Project** — managed Postgres の project、branch、endpoint をプロビジョニングし、接続情報を控えておきます。
5. **Lakebase Data Persistence** — `lakebase()` plugin、schema のセットアップ、新しい project に対する CRUD の仕組みを追加します。
6. **Lakebase Agent Memory** — `chat.chats` テーブルと `chat.messages` テーブルを作成し、すべての会話のやり取りを 1 ターンずつ永続化します。

### 始める前に \{#before-you-start\}

以下の各ステップには、それぞれ必要なワークスペース機能の確認項目を記載しています。アプリ全体としては、Model Serving (Databricks がホストする foundation-model endpoint) 、Lakebase Postgres、Databricks Apps に接続できる Databricks CLI profile が必要です。構築の途中で利用できない機能に行き当たらないよう、各ステップの前提条件チェックは事前に済ませておいてください。