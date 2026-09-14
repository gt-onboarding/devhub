---
title: Unity AI Gateway
sidebar_label: Unity AI Gateway
description: Model Serving プラグインを使って、AppKit アプリからガバナンスされた LLM endpoint を呼び出します。Unity AI Gateway により、レート制限、使用状況の追跡、ガードレール、コスト配分が利用できます。
sourceOfTruth:
  skills:
    - databricks-model-serving
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/ai-gateway/ai-governance
  note: "databricks-model-serving では、サービング endpoint の呼び出し経路と AI Gateway のレート制限を扱います。AI Gateway の全体的なガバナンス、モデルサービス、MCP ガバナンスはドキュメントのみの提供です（スキルは未提供）。"
---

# Unity AI Gateway \{#unity-ai-gateway\}

**Unity AI Gateway** は、LLM endpoint と MCP サーバーを対象とした Databricks のガバナンスレイヤーです。レート制限の適用、ガードレールの適用、使用量とコストの追跡を行います。製品全体の紹介については [Unity AI Gateway の概要](https://docs.databricks.com/aws/en/ai-gateway/) を参照してください。AppKit アプリからは、Model Serving プラグインを使ってガバナンス対象の endpoint を呼び出します。このページでは、AppKit での接続方法と、endpoint の確認・プロビジョニングに使う CLI について説明します。

## 前提条件 \{#prerequisites\}

- [認証済みプロファイル](/docs/tools/databricks-cli#authenticate)を設定した Databricks CLI `v1.0.0+`。
- 実行中の AppKit アプリ。[Apps クイックスタート](/docs/apps/quickstart)を参照してください。
- アプリからクエリできる サービング endpoint。ほとんどのワークスペースには、AI Gateway が事前構成された Databricks ホスト型の foundation model（`databricks-` で始まるもの。たとえば `databricks-claude-sonnet-4-6`）が用意されています。モデル ID は随時変更されるため、最新の名前は[サポートされているモデル](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models)の一覧で確認するか、[利用可能な endpoint の一覧表示](#list-available-endpoints)を実行して、ご利用のワークスペースで公開されているものを確認してください。

## AppKit からガバナンス対象の endpoint を呼び出す \{#call-a-governed-endpoint-from-appkit\}

[Model Serving プラグイン](/docs/appkit/v0/plugins/model-serving) が HTTP 通信、認証、ストリーミングの処理を担います。endpoint 名は runtime に環境変数から取得されるため、同じコードをローカルでも本番でもそのまま動かせます。

### プラグインを登録する \{#register-the-plugin\}

```typescript title="server/server.ts"
import { createApp, server, serving } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [
    server(),
    serving({
      endpoints: {
        chat: { env: "DATABRICKS_SERVING_ENDPOINT_NAME" },
      },
    }),
  ],
});
```

`chat` は自由に決められるエイリアスです。プラグインはリクエスト時に `DATABRICKS_SERVING_ENDPOINT_NAME` を読み取って解決します。`app.yaml` で次のように環境変数をバインドします。

```yaml title="app.yaml"
env:
  - name: DATABRICKS_SERVING_ENDPOINT_NAME
    valueFrom: serving-endpoint
```

デプロイ時に、Databricks Apps が endpoint 名をコンテナに注入します。ローカル開発では、`.env` に環境変数を設定してください。


### React コンポーネントからストリーミングする \{#stream-from-a-react-component\}

```tsx title="client/src/ChatPanel.tsx"
import { useState } from "react";
import { useServingStream } from "@databricks/appkit-ui/react";

export function ChatPanel() {
  const [prompt, setPrompt] = useState("");
  const { stream, chunks, streaming, error, reset } = useServingStream(
    { messages: [{ role: "user", content: prompt }], max_tokens: 500 },
    { alias: "chat" },
  );

  return (
    <>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={() => stream()} disabled={streaming || !prompt}>
        Send
      </button>
      <button onClick={reset}>Clear</button>
      {chunks.map((chunk, i) => (
        <pre key={i}>{JSON.stringify(chunk)}</pre>
      ))}
      {error && <p>{error}</p>}
    </>
  );
}
```

第1引数はリクエストボディです。第2引数には、エイリアスなどのオプションを指定します。このフックはSSE接続を管理し、アンマウント時に接続を中断して、パース済みのチャンクをstateに蓄積します。ストリーミングしない呼び出しには、同じ形式で `useServingInvoke` を使用してください。

チャットモデルの場合は、各チャンクからテキスト (通常は `chunk.choices?.[0]?.delta?.content`) を抽出し、連結して表示します。開発時には、生のチャンクをJSONとして描画しておくと、表示ロジックを組み立てる前にデータ構造を確認できます。


### ルートハンドラーから呼び出す \{#call-it-from-a-route-handler\}

エージェントのオーケストレーション、前処理・後処理、バックエンドでのログ記録を行う場合は、プラグインを直接呼び出します。プラグインに組み込まれた HTTP ルートは、デフォルトで認証済みユーザーとして実行されます。以下のようなカスタムルートハンドラーでは、`.asUser(req)` を明示的に呼び出すことで、同じユーザー単位の動作になります。

```typescript title="server/server.ts"
AppKit.server.extend((app) => {
  app.post("/api/summarize", async (req, res) => {
    const { text } = req.body;
    const result = await AppKit.serving("chat")
      .asUser(req)
      .invoke({
        messages: [
          { role: "system", content: "Summarize the text in two sentences." },
          { role: "user", content: text },
        ],
      });
    res.json(result);
  });
});
```


### 名前付きモードとデフォルトモード \{#named-versus-default-mode\}

上記の例では、明示的なエイリアスを指定する**名前付きモード**を使用しています。設定を省略すると、`DATABRICKS_SERVING_ENDPOINT_NAME` を参照する `default` エイリアスが登録されます。名前付きモードなら、同じアプリ内で複数の endpoint（チャット、分類器、埋め込み）へ拡張できます。

## ガバナンスと Unity AI Gateway \{#governance-and-unity-ai-gateway\}

ガバナンスは AppKit ではなく Databricks 側で適用されます。アプリが endpoint を呼び出すと、ゲートウェイがポリシーを適用します。Unity AI Gateway は AI トラフィックのコントロールプレーンであり、モデルおよび MCP のリクエストをルーティングし、レート制限、コスト管理、サービスポリシー、使用状況の追跡を適用します。その背後にあるモデル、MCP サーバー、関数は Unity Catalog が管理します。現在の機能とセットアップ方法（アカウントコンソールの Previews ページから有効化できるベータ機能を含む）については、[AI governance with Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/ai-governance) を参照してください。

AppKit では、Model Serving プラグインがサービング endpoint を名前で呼び出します。対象となるのは foundation model（`databricks-` プレフィックス）、Knowledge Assistant、Supervisor Agent、カスタム Python エージェントです。このプラグインは Unity AI Gateway のモデルサービスは呼び出しません。モデルサービスは Unity Catalog オブジェクトであり、ゲートウェイの OpenAI 互換 API を通じて完全修飾名でクエリします。利用方法については [Query model services](https://docs.databricks.com/aws/en/ai-gateway/query-model-services) を参照してください。

それぞれの詳細は以下を参照してください。

- モデルサービス: [overview](https://docs.databricks.com/aws/en/ai-gateway/model-services) と [governance](https://docs.databricks.com/aws/en/ai-gateway/govern-model-services)。
- モデルプロバイダーサービス: [overview](https://docs.databricks.com/aws/en/ai-gateway/model-provider-services) と [governance](https://docs.databricks.com/aws/en/ai-gateway/govern-model-provider-services)。
- MCP サーバーのガバナンス: [register an MCP service](https://docs.databricks.com/aws/en/ai-gateway/register-mcp-service) と [govern it](https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service)。これは、呼び出し先のエージェント endpoint（Supervisor Agent やカスタム Python エージェントなど）が内部で MCP サーバーにルーティングする場合に該当します。AppKit アプリ側で直接設定するものではありません。
- 以前のバージョン: [AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints)。endpoint ごとに機能を切り替え、使用状況ログは `system.serving.endpoint_usage` に記録されます。

## 利用可能な endpoint の一覧表示 \{#list-available-endpoints\}

CLI を使うと、ワークスペースが公開している endpoint と、そのうち AI Gateway 機能がすでに構成済みのものを確認できます。以下の各コマンドでは、代表的な実行例と利用可能なフラグの一覧を示します。フラグの最新の挙動は `databricks serving-endpoints <command> --help` で確認してください。CLI が信頼できる情報源です。

```bash title="Common"
databricks serving-endpoints list -o json
```

```bash title="All Options"
databricks serving-endpoints list \
  --limit $LIMIT \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

foundation model API の endpoint (接頭辞 `databricks-`) は、AI Gateway が組み込まれたほとんどのワークスペースで利用できます。たとえば `databricks-claude-sonnet-4-6` などです。利用できるかどうかはワークスペースによって異なります。

<details>
<summary>出力例（一部省略）</summary>

```json
[
  {
    "ai_gateway": {
      "usage_tracking_config": { "enabled": true }
    },
    "config": {
      "served_entities": [
        {
          "foundation_model": {
            "display_name": "Claude Sonnet 4.6",
            "name": "system.ai.databricks-claude-sonnet-4-6"
          },
          "name": "databricks-claude-sonnet-4-6"
        }
      ]
    },
    "name": "databricks-claude-sonnet-4-6",
    "state": { "config_update": "NOT_UPDATING", "ready": "READY" },
    "task": "llm/v1/chat"
  }
]
```

</details>

<!-- cli-options:serving-endpoints list -->

| オプション             | 説明                                 |
| ----------------- | ---------------------------------- |
| `--limit`         | 返す結果の最大件数。                         |
| `--debug`         | デバッグログを有効にする                       |
| `--output`, `-o`  | 出力形式: text または json (デフォルトは text)  |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル           |
| `--target`, `-t`  | 使用する bundle target (該当する場合)        |

<!-- /cli-options -->


## endpoint を確認する \{#inspect-an-endpoint\}

```bash
databricks serving-endpoints get databricks-claude-sonnet-4-6 -o json
```

レスポンスに `ai_gateway` が含まれているかを確認し、endpoint に AI Gateway が設定されていることを確かめます。`get` にはグローバルフラグ以外にコマンド固有のフラグはないため、必要に応じて `databricks serving-endpoints get --help` を実行してください。


## ターミナルからクエリを実行する \{#query-from-the-terminal\}

アプリに組み込む前に、endpoint の動作を手軽に確認したい場合に便利です。

```bash title="Common"
databricks serving-endpoints query databricks-claude-sonnet-4-6 \
  --json '{"messages": [{"role": "user", "content": "Hello"}], "max_tokens": 100}'
```

```bash title="All Options"
databricks serving-endpoints query $ENDPOINT_NAME \
  --json '{"messages": [{"role": "user", "content": "Hello"}]}' \
  --max-tokens 100 \
  --n 1 \
  --temperature 0.7 \
  --stream \
  --client-request-id $REQUEST_ID \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:serving-endpoints query -->

| オプション                 | 説明                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `--client-request-id` | 推論テーブルおよび使用状況トラッキングテーブルに記録される、任意指定のリクエスト識別子。                                                             |
| `--json`              | インライン JSON 文字列、またはリクエストボディを含む @path/to/file.json (デフォルト JSON (0 bytes))                                  |
| `--max-tokens`        | **completions** および **chat external &amp; foundation model** のサービング endpoint でのみ使用される max tokens フィールド。  |
| `--n`                 | **completions** および **chat external &amp; foundation model** のサービング endpoint でのみ使用される n (候補数) フィールド。     |
| `--stream`            | **completions** および **chat external &amp; foundation model** のサービング endpoint でのみ使用される stream フィールド。      |
| `--temperature`       | **completions** および **chat external &amp; foundation model** のサービング endpoint でのみ使用される temperature フィールド。 |
| `--debug`             | デバッグログを有効にする                                                                                             |
| `--output`, `-o`      | 出力形式: text または json (デフォルト text)                                                                         |
| `--profile`, `-p`     | ~/.databrickscfg のプロファイル                                                                                 |
| `--target`, `-t`      | 使用する bundle target (該当する場合)                                                                              |

<!-- /cli-options -->


## endpoint をプロビジョニングする \{#provision-an-endpoint\}

```bash title="Common"
databricks serving-endpoints create my-model-endpoint \
  --json '{
    "config": {
      "served_entities": [
        {
          "name": "my-entity",
          "entity_name": "my-registered-model",
          "workload_size": "Small",
          "scale_to_zero_enabled": true
        }
      ]
    }
  }'
```

```bash title="All Options"
databricks serving-endpoints create $ENDPOINT_NAME \
  --json @config.json \
  --budget-policy-id $BUDGET_POLICY_ID \
  --description "My model endpoint" \
  --route-optimized \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

クエリを実行する前に、endpoint が `READY` 状態になるまで待ちます。手順の詳細については、[Create a Model Serving Endpoint](/templates/model-serving-endpoint-creation) template を参照してください。

<!-- cli-options:serving-endpoints create -->

| オプション                | 説明                                                                       |
| -------------------- | ------------------------------------------------------------------------ |
| `--budget-policy-id` | サービング endpoint に適用する予算ポリシー。                                              |
| `--description`      |                                                                          |
| `--json`             | インライン JSON 文字列、またはリクエストボディを含む @path/to/file.json (デフォルト JSON (0 bytes))  |
| `--no-wait`          | NOT&#95;UPDATING 状態になるまで待機しない                                            |
| `--route-optimized`  | サービング endpoint のルート最適化を有効にする。                                            |
| `--timeout`          | NOT&#95;UPDATING 状態になるまでの最大待機時間 (デフォルト 20m0s)                            |
| `--debug`            | デバッグログを有効にする                                                             |
| `--output`, `-o`     | 出力タイプ: text または json (デフォルト text)                                        |
| `--profile`, `-p`    | ~/.databrickscfg のプロファイル                                                 |
| `--target`, `-t`     | 使用する bundle target (該当する場合)                                              |

<!-- /cli-options -->


## コーディングエージェントとの統合 \{#coding-agent-integrations\}

Unity AI Gateway は、Cursor、Codex CLI、Gemini CLI といった AI コーディングツールもガバナンスの対象にできます。これにより、これらのツールからのリクエストを単一の請求、使用状況ダッシュボード、レート制限で一元的に管理できます。Databricks では、このセットアップに [`ucode`](https://github.com/databricks/ucode) を使用することを推奨しています。セットアップ手順と現在サポートされているツールの一覧については、[コーディングエージェントとの統合](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-model-services)を参照してください。

## 次のステップ \{#where-to-next\}

[AI Chat App](/templates/ai-chat-app) を試して、ガバナンス対象の endpoint をアプリに組み込んでみましょう。他のエージェント機能もあわせてご覧ください。[Genie Agents](/docs/agents/genie) や [Custom agent endpoints](/docs/agents/custom-agents) もおすすめです。