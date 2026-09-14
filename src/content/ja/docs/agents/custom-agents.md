---
title: カスタムエージェントのエンドポイント
sidebar_label: カスタムエージェント
description: Knowledge Assistant、Supervisor Agent、またはカスタム Python エージェントを AppKit アプリから呼び出します。いずれも Model Serving プラグインに接続できます。
sourceOfTruth:
  skills:
    - databricks-agent-bricks
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/agents/agent-bricks/
    - https://docs.databricks.com/aws/en/agents/custom-agents/author-agent
  note: "databricks-agent-bricks covers the Knowledge Assistant and Supervisor builders. Custom Python agent authoring is docs-only (no skill yet)."
---

# カスタムエージェントの endpoint \{#custom-agent-endpoints\}

AppKit アプリで foundation model の応答や Genie 形式のデータクエリだけでは足りない場合は、**custom agent** を使います。これは、指示、ツール、ドキュメントによるグラウンディング、マルチエージェントのオーケストレーションによって形作られた LLM です。AppKit からは次の方法で実行できます。

- [`agents` プラグイン](/docs/appkit/v0/plugins/agents)で **アプリ内で実行する**。エージェントをコードまたは Markdown で定義するか、Supervisor API アダプター経由でマネージドな Supervisor を実行します。別途 endpoint をデプロイする必要はありません。エージェントを自分で新規に構築する場合は、まずこの方法から始めてください。
- [Model Serving プラグイン](/docs/appkit/v0/plugins/model-serving)で **すでに serving endpoint になっているエージェントを呼び出す**。Knowledge Assistant や、共有 endpoint としてすでにデプロイ済みのエージェントにはこちらを使用します。

## 前提条件 \{#prerequisites\}

- [認証済みプロファイル](/docs/tools/databricks-cli#authenticate)を設定した Databricks CLI `v1.0.0+`。
- 実行中の AppKit アプリ。[Apps クイックスタート](/docs/apps/quickstart)を参照してください。
- 以下の endpoint パスを使う場合は、サービング endpoint としてデプロイ済みのエージェント。

## App 内でエージェントを実行する \{#run-an-agent-inside-your-app\}

[`agents` プラグイン](/docs/appkit/v0/plugins/agents)は、App 内でエージェントをホストします。Markdown またはコードでエージェントを定義してツールを接続すれば、組み込みのルートで提供されるため、プロビジョニングが必要な endpoint はありません。新しいカスタムエージェントや Supervisor Agent を作成する場合は、ここから始めてください。

Genie space、Unity Catalog 関数、その他のエージェントを統括する Supervisor の場合は、Supervisor API アダプターがそのエージェントを Databricks 上のマネージドサービスとして実行します。

```typescript title="server/server.ts"
import { createApp } from "@databricks/appkit";
import {
  agents,
  createAgent,
  DatabricksAdapter,
} from "@databricks/appkit/beta";

await createApp({
  plugins: [
    agents({
      agents: {
        assistant: createAgent({
          instructions: "You are a helpful assistant.",
          model: DatabricksAdapter.fromSupervisorApi({
            model: "databricks-claude-sonnet-4-6",
          }),
        }),
      },
    }),
  ],
});
```

マークダウンエージェント、ツールのスコープ設定、サブエージェント、ホスト型 Supervisor ツールについては、[`agents` プラグインリファレンス](/docs/appkit/v0/plugins/agents)を参照してください。

## 既存のエージェント endpoint を呼び出す \{#call-an-existing-agent-endpoint\}

エージェントによっては、アプリ内で実行するのではなく Model Serving の endpoint として呼び出します。Knowledge Assistant は必ずこの形式で、Supervisor Agent やカスタム Python エージェントもこの形式にできます。Model Serving プラグインは、foundation model と同じように、これらをすべて名前で呼び出せます。こうした endpoint を生成するビルダーは次のとおりです。

| ビルダー             | 用途                                                                       | セットアップ                                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Knowledge Assistant | ドキュメントに対する Q&A（引用付き）                                        | [Knowledge Assistant](https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant)（ワークスペース UI）                                                                                                                      |
| Supervisor Agent    | Genie Agent、他のエージェント、Unity Catalog 関数、MCP サーバーを連携させる | [Supervisor Agent](https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor)（ワークスペース UI）、またはコードで構築する場合は [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) |
| カスタム Python エージェント | 他のどれも当てはまらない場合：独自のオーケストレーション、ツール、フレームワーク                 | Python で [エージェントを作成する](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent)                                                                                                                                     |

Knowledge Assistant と Supervisor Agent のビルダーは、ワークスペース上でクリック操作だけで利用できます。[`databricks-agent-bricks`](/docs/tools/ai-tools/agent-skills) エージェントスキルを使って、コーディングエージェントから作成することもできます。[Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) は Supervisor Agent を Python で定義するためのもので、ワークスペース UI よりもコードを好むチームに適しています。

`agents.deploy()` でカスタムエージェントを専用の Model Serving endpoint にデプロイする方法はレガシーな手段です。上記のとおりアプリ内で実行することを推奨します。詳しくは [エージェントを作成する](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) および [Databricks Apps への移行](https://docs.databricks.com/aws/en/agents/custom-agents/migrate-agent-to-apps) を参照してください。

## 接続する \{#wire-it-up\}

Model Serving プラグインは、foundation model の endpoint と同じ方法でエージェントの endpoint を呼び出します。プラグインがエージェントの環境変数を参照するように設定します。

```typescript title="server/server.ts"
serving({
  endpoints: {
    assistant: { env: "DATABRICKS_AGENT_ENDPOINT" },
  },
}),
```

`app.yaml` で環境変数を `serving-endpoint` リソースにバインドします。

```yaml title="app.yaml"
env:
  - name: DATABRICKS_AGENT_ENDPOINT
    valueFrom: serving-endpoint
```

エージェントの endpoint をアプリのリソースとして追加すると (Databricks Apps の UI または CLI から) 、Databricks はアプリのサービスプリンシパルにその endpoint に対する `CAN QUERY` を付与します。

`createApp`、`useServingStream`、カスタムルートハンドラーを含む完全な連携パターンについては、[AppKit からガバナンス適用済みの endpoint を呼び出す](/docs/agents/ai-gateway#call-a-governed-endpoint-from-appkit)を参照してください。

## レスポンスの形式 \{#what-the-response-looks-like\}

ストリーミングレスポンスは `useServingStream` のチャンクとして届きます。非ストリーミングの呼び出しでは、`useServingInvoke` が完全なオブジェクトを返します。リクエストの形式は通常 OpenAI Chat Completions 互換です（`messages`、`max_tokens`、任意で `stream`）。`ResponsesAgent` をベースに構築された endpoint では、代わりに OpenAI Responses API を使用します（`messages` の代わりに `input`）。

レスポンスの形式はビルダーによって異なるため、推測せず次の手順で確認してください。

1. ワークスペースでエージェントの endpoint を開き、**Open in Playground** をクリックします。
2. **Get code** をクリックし、**Curl API** または **Python API** を選択します。
3. サンプルを実行してレスポンスを確認し、実際のフィールドを把握します。

## ユーザーごとの権限 \{#per-user-permissions\}

AppKit のサービングルートは、デフォルトで認証済みユーザーとして実行されます。エージェントがユーザースコープのデータにアクセスする場合（たとえば、ユーザーがクエリできる Genie Agent にルーティングする Supervisor Agent など）、そのユーザーに閲覧権限のあるデータだけが表示されます。追加の認証コードは必要ありません。

組み込みプラグインルート以外のサーバーロジック（カスタムの Express ルートなど）では、`AppKit.serving("assistant").asUser(req).invoke(...)` を呼び出すことでユーザーごとの動作を維持できます。リクエストを伴わないバックグラウンド処理（スケジュールされたタスクやワーカーなど）では `asUser` を省略すると、アプリのサービスプリンシパルとして実行されます。

## 次のステップ \{#where-to-next\}

AppKit とエージェントの一通りのセットアップを試すには [AI Chat App](/templates/ai-chat-app) を、その他のパターンを探すには [テンプレートカタログ](/templates) をご覧ください。