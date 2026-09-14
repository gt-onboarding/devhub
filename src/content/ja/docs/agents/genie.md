---
title: Genie Agents
sidebar_label: Genie
description: AppKit の Genie プラグインと GenieChat コンポーネントを使って、Unity Catalog テーブルを対象としたチャットインターフェイスを埋め込みます。text-to-SQL のコードもプロンプトもカスタム LLM も不要です。
sourceOfTruth:
  skills:
    - databricks-genie-agents
  docs:
    - /docs/appkit/v0/plugins/genie
    - https://docs.databricks.com/aws/en/genie-agents/
---

# Genie Agents \{#genie-agents\}

データに問い合わせできるチャットボックスをユーザーに提供しましょう。text-to-SQL も、スキーマのマッピングも、独自の LLM も必要ありません。**Genie Agent** (旧 Genie space) は、Unity Catalog のテーブルに対する Databricks の自然言語インターフェイスです。キュレーションされたデータセット、ナレッジストア (同義語、SQL の例、列の説明) 、そして質問を SQL に変換する複合 AI システムで構成されています。AppKit アプリなら、サーバー側のプラグイン 1 つとページ上のコンポーネント 1 つで組み込めます。

埋め込む前にワークスペースで Genie Agent を試すには、[Genie Agent を使用する](https://docs.databricks.com/aws/en/genie-agents/talk-to-genie)を参照してください。コーディングエージェントから作成・管理する場合は、[`databricks-genie-agents`](/ja/docs/tools/ai-tools/agent-skills) エージェントスキルを使用してください。

:::note[Genie ファミリーにおける Genie Agents]

Genie は Databricks の製品ファミリーであり、Genie One、Genie Agents、Genie Code が含まれます。このページでは、Unity Catalog のテーブルに対する自然言語インターフェイスである Genie Agents と、それを AppKit アプリに埋め込む方法を説明します。その他の製品については、[Genie の概要](https://docs.databricks.com/aws/en/genie/)を参照してください。

:::

## 前提条件 \{#prerequisites\}

* [認証済みプロファイル](/ja/docs/tools/databricks-cli#authenticate)を設定した Databricks CLI `v1.0.0+`。
* 稼働中の AppKit アプリ。[Apps クイックスタート](/ja/docs/apps/quickstart)を参照してください。
* Unity Catalog テーブル上に構成された Genie Agent。セットアップ手順は [Genie Agent の作成と管理](https://docs.databricks.com/aws/en/genie-agents/set-up)を参照してください。

  アプリの設定 (UI または CLI) で **Can run** を選択してエージェントをリソースとしてアタッチすると、Databricks がアプリのサービスプリンシパルにその権限を付与します。続いて `app.yaml` がそのリソースを環境変数にバインドします。エンドユーザーの権限については[以下](#permissions-and-data-access)で説明します。

## Genie を使う理由 \{#why-genie\}

質問から結果まで、Genie は次のように動作します。

* Unity Catalog のテーブル、シノニム、サンプル SQL、列の説明から**スキーマを理解**します。
* 自然言語の質問から **SQL を生成**し、プロンプトが曖昧な場合は追加で確認を求めます。
* ウェアハウスに対して**クエリを実行**し、そのまま描画できる表形式の結果を返します。

[`genie` プラグイン](/ja/docs/appkit/v0/plugins/genie)を使えば、SSE ストリーミング、認証、会話のリプレイまで面倒を見たうえで、これらすべてをチャット UI に接続できます。

## プラグインを組み込む \{#wire-the-plugin\}

1つ以上の space エイリアスを指定してプラグインを登録します。エイリアスのキーは、フロントエンドコンポーネントの `alias` プロパティになります。

```typescript title="server/server.ts"
import { createApp, genie, server } from "@databricks/appkit";

await createApp({
  plugins: [
    server(),
    genie({
      spaces: {
        sales: process.env.SALES_GENIE_SPACE_ID!,
      },
    }),
  ],
});
```

`app.yaml` で各エイリアスを Genie Agent リソースにバインドします。

```yaml title="app.yaml"
env:
  - name: SALES_GENIE_SPACE_ID
    valueFrom: genie-space
```

Databricks Apps のランタイムは、リソースの space ID を環境変数に注入します。space ID は、ワークスペース内の Genie Agent ページの **Settings** タブで確認できます。

エージェントが 1 つだけのアプリの場合は、`spaces` の設定を省略し、プラグインのデフォルトの環境変数をバインドします。

```yaml title="app.yaml"
env:
  - name: DATABRICKS_GENIE_SPACE_ID
    valueFrom: genie-space
```

`spaces` を渡さない場合、プラグインは `DATABRICKS_GENIE_SPACE_ID` を読み取り、`default` エイリアスとして登録します。

## チャットコンポーネントをレンダリングする \{#render-the-chat-component\}

```tsx title="client/src/pages/ChatPage.tsx"
import { GenieChat } from "@databricks/appkit-ui/react";

export function ChatPage() {
  return (
    <div style={{ height: 600 }}>
      <GenieChat alias="sales" />
    </div>
  );
}
```

`alias` プロパティは、サーバー側の `spaces` 設定のキーと一致している必要があります。`<GenieChat>` は親要素いっぱいに広がるため、高さを固定したコンテナに配置しないと高さが 0 になってしまいます。このコンポーネントは、メッセージの描画、ストリーミングの処理、会話 ID の URL への保存、再読み込み時の履歴の復元を行います。プロパティの全一覧については [GenieChat リファレンス](/ja/docs/appkit/v0/api/appkit-ui/genie/GenieChat) を参照してください。

## `useGenieChat` によるカスタム UI \{#custom-ui-with-usegeniechat\}

独自のチャット UI を構築する場合は、フックを直接使用します。同じメッセージストリームに加えて、リクエストのライフサイクルを表す状態が返されます。

```tsx title="client/src/pages/CustomChat.tsx"
import { useGenieChat } from "@databricks/appkit-ui/react";

export function CustomChat() {
  const { messages, status, sendMessage, reset } = useGenieChat({
    alias: "sales",
  });

  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} data-role={msg.role}>
          {msg.content}
        </div>
      ))}
      <button
        onClick={() => sendMessage("What were total sales last quarter?")}
        disabled={status === "streaming"}
      >
        Ask
      </button>
      <button onClick={reset}>New conversation</button>
    </>
  );
}
```

`status` は `idle`、`streaming`、`loading-history`、`loading-older`、`error` の間を遷移します。これを使って UI のローディング状態を制御してください。このフックは `error`、`conversationId`、ページネーション用のヘルパー (`hasPreviousPage`、`isFetchingPreviousPage`、`fetchPreviousPage`) も返します。戻り値の型の詳細は [AppKit Genie プラグインリファレンス](/ja/docs/appkit/v0/plugins/genie) を、基盤となる REST API については [Genie conversation API](https://docs.databricks.com/aws/en/genie-agents/conversation-api) を参照してください。

## 複数のspace \{#multiple-spaces\}

space を複数登録すれば、ユーザーはドメインを切り替えて利用できます。たとえば、同じアプリ内に営業用の space とサポート用の space を用意するといったことが可能です。

```typescript title="server/server.ts"
genie({
  spaces: {
    sales: process.env.SALES_GENIE_SPACE_ID!,
    support: process.env.SUPPORT_GENIE_SPACE_ID!,
  },
}),
```

各 ID を `app.yaml` 内の個別のリソースにバインドします。エージェントの切り替え、会話のクリーンアップ、URL 同期に対応した実際に動作する UI については、[Genie Multi-Agent Selector](/ja/templates/genie-multi-space) テンプレートを参照してください。

## 権限とデータアクセス \{#permissions-and-data-access\}

`genie` プラグインは、サインイン中のユーザーに代わって Genie API を呼び出します。リクエストを成功させるには、アプリのサービスプリンシパルとエンドユーザーの双方にアクセス権が必要です。

* **アプリのサービスプリンシパル**: Genie Agent に対する `CAN RUN` 権限。エージェントをアプリリソースとして (UI または CLI で) アタッチし、**Can run** を選択すると付与されます。基盤となるデータに対する権限は自動的にはプロビジョニングされないため、Unity Catalog のテーブルに対する `USE CATALOG`、`USE SCHEMA`、`SELECT` をサービスプリンシパルに個別に付与してください。[Add a Genie Agent resource to an app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/genie) を参照してください。
* **エンドユーザー**: Genie Agent へのアクセス権 (個別またはグループ経由での共有) と、同じテーブルに対する `SELECT` 権限。アクセス権がないユーザーの場合、呼び出しは 403 を返します。権限チェックを自分で実装する必要はありません。

## 次のステップ \{#where-to-next\}

すぐに動く構成一式を試すには [Genie Analytics App](/ja/templates/genie-analytics-app) を、Knowledge Assistant や Supervisor Agent については [カスタムエージェントの endpoint](/ja/docs/agents/custom-agents) を参照してください。