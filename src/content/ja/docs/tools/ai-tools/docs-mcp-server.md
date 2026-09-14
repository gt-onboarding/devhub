---
title: Docs MCP Server
---

# Docs MCP Server \{#docs-mcp-server\}

DevHub の Docs MCP Server は、コーディングエージェントや IDE アシスタントに、DevHub 上のすべてのドキュメントページへの読み取りアクセスを提供します。エージェントはエディタを離れることなく、利用可能なページを検出し、個々のドキュメントを Markdown 形式で取得できます。

## インストール \{#install\}

対応するコーディングエージェント (Cursor、Claude Code、VS Code、Codex など) へ、コマンド 1 つでサーバーを追加できます。

グローバルインストール (ユーザーレベル。すべてのプロジェクトで利用可能) :

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g
```

プロジェクト単位のインストール (カレントディレクトリのみ) :

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs
```

特定のエージェントを指定するには、`-a` を追加します。

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g -a cursor
```

サーバーを追加したら、エディタを再起動してください。Cursor などの一部のエディタでは、MCP 設定ページを開いて新しいサーバーを有効化する必要があります。


## 接続を確認する \{#verify-the-connection\}

インストール後、サーバーが動作していることを確認します。

1. ツール一覧に `devhub-docs` が表示されていることを確認します。
   - 例: 「devhub-docs の MCP はインストールされていますか?」
2. エージェントに `list_docs_resources` の呼び出しを依頼し、ドキュメントのインデックスが返ることを確認します。
   - 例: 「devhub で利用できるドキュメントは何ですか?」
3. エージェントに `get_doc_resource` で特定のページを取得するよう依頼します。
   - 例: 「start-here ページの内容を教えてください」

実際には、これらのツールを直接呼び出すことを意識する必要はありません。エージェントに作業を頼めば、内部でツールが呼び出されます。

## ツールリファレンス \{#tools-reference\}

このサーバーは、読み取り専用のツールを 2 つ公開します。

### `list_docs_resources` \{#list_docs_resources\}

利用可能な Databricks 開発者向けドキュメントページをすべて一覧表示します。ページの URL とタイトルを含むドキュメントインデックスを Markdown 形式で返します。

パラメーターはありません。

```
list_docs_resources()
→ markdown index of all doc pages with slugs and titles
```


### `get_doc_resource` \{#get_doc_resource\}

Databricks 開発者向けドキュメントのページを 1 件、Markdown形式で取得します。まず `list_docs_resources` で利用可能なスラッグを確認してください。

| パラメータ  | 型      | 必須 | 説明                                                                            |
| ------ | ------ | -- | ----------------------------------------------------------------------------- |
| `slug` | string | はい | ドキュメントページのスラッグ (パス) 。例: `start-here`。スラッグを調べるには `list_docs_resources` を使用します。 |

```
get_doc_resource(slug: "start-here")
→ full markdown content of the requested page
```

信頼できる情報源を宣言しているページは、短い **Source of truth** 行で始まります。この行には、その製品の現在の動作を把握するために読み込むべきエージェントスキルと正式なドキュメントが示されます。

## 次のステップ \{#where-to-next\}

[Databricks CLI](/docs/tools/databricks-cli)、[エージェントスキル](/docs/tools/ai-tools/agent-skills)、Docs MCP Server がすべて揃えば、コーディングエージェントはビルドとデプロイに必要なものをすべて備えた状態になります。

さっそく構築を始めましょう。[templates](/docs/templates) を使ってプロジェクトの雛形を素早く作成する方法を確認するか、[templates カタログ](/templates)を直接ご覧ください。