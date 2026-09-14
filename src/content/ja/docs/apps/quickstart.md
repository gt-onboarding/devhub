---
title: クイックスタート
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# クイックスタート \{#quickstart\}

## 前提条件 \{#prerequisites\}

- Databricks CLI `v1.0.0+`（[認証済みプロファイル](/docs/tools/databricks-cli#authenticate)が設定済みであること）
- Node.js 22 以降（AppKit アプリは Node/TypeScript で動作します）
- Apps が有効化された Databricks workspace

## テンプレートを使う \{#template-path\}

[テンプレート](/templates)は、ユースケース別に整理されたエージェント向けのプロンプトです。用途に合うものを選んで AI コーディングアシスタントに貼り付ければ、スキャフォールディング、プラグインの選択、デプロイまでアシスタントが対応します。

よく使われる出発点:

| テンプレート                                                                            | 適した用途                                    |
| --------------------------------------------------------------------------------- | ---------------------------------------- |
| [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) | CLI のインストール、認証、workspace の確認             |
| [Spin Up a Databricks App](/templates/spin-up-databricks-app)                     | 新規 AppKit アプリのスキャフォールディング、ローカル実行、デプロイ    |
| [Onboard Your Coding Agent](/templates/onboard-your-coding-agent)                 | エージェントスキルのインストール、DevHub Docs MCP サーバーの接続 |
| [AI Chat App](/templates/ai-chat-app)                                             | 対話型 AI、チャットボット、アシスタント                    |
| [App with Lakebase](/templates/app-with-lakebase)                                 | 永続ストレージを備えた CRUD アプリ                     |

[テンプレートカタログ](/templates)には、[Lakebase Postgres](/docs/lakebase/quickstart)、[Genie Agents](/docs/agents/genie)、[Unity AI Gateway](/docs/agents/ai-gateway)、[Agent Bricks](/docs/agents/overview) を含む一覧がすべて掲載されています。

テンプレートを貼り付ける前に[エージェントスキル](/docs/tools/ai-tools/agent-skills)をインストールして、AI アシスタントに Databricks プラットフォームのコンテキストを与えましょう:

```bash
databricks aitools install
```


## 手動での手順 \{#manual-path\}

テンプレートを使わなくても、`databricks apps init` を実行すれば動作する AppKit プロジェクトが生成されます。以下は `--features lakebase` を指定した場合に生成される内容です (自分で記述する必要はありません) 。

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

AppKit.server.extend((app) => {
  app.get("/api/items", async (_req, res) => {
    const { rows } = await AppKit.lakebase.query("SELECT * FROM items");
    res.json(rows);
  });
});
```

スキャフォールドを生成し、ローカルで実行して、デプロイします。

```bash
databricks apps init --name my-app --features lakebase   # 上記のプロジェクトを生成
cd my-app && npm install && npm run dev                  # ローカルで実行
databricks apps deploy                                   # workspace にデプロイ
```

デプロイが完了すると、CLI がアプリの workspace URL を表示します。

特定のプラグインを含めてスキャフォールドするには、`--features` にカンマ区切りのリストを渡します。`databricks apps manifest` を実行すると、利用可能なすべてのプラグインと、それぞれに必要なリソースフィールドを確認できます。


## 次のステップ \{#where-to-next\}

ローカル開発ワークフローの全体像、デプロイ時のフラグ、プラグインのセットアップについては、[アプリ開発](/docs/apps/development)を参照してください。