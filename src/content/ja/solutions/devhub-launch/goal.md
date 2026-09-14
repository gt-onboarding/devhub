Hello World、developers.databricks.com!

**developers.databricks.com** を公開しました。すでに自社で稼働している Databricks ワークスペース上に社内向けアプリを構築する開発者のためのサイトです。

チームのデータがすでに Databricks にあり、その上に何かを作りたい——社内ドキュメントに対するチャット、agentic な社内ツール、分析用フロントエンドなど——という場合、このサイトは空のフォルダから deploy 済みアプリまでの最短ルートになります。

## なぜ作ったのか \{#why-we-built-this\}

私たちはエンジニアです。Databricks 上での開発を始めた当時に「こんなものがあればよかった」と思えるリソースを、自分たちの手で作りたいと考えました。つまり、コードを起点とし、明確な方針を持ち、最初から最後まで通読できる程度に短いものです。公式の Databricks ドキュメントは網羅的で、幅広い読者に向けて作られています。developers.databricks.com は、その開発者向けの姉妹サイトという位置づけです。コピー＆ペーストでき、AI エージェントにも扱いやすく、Databricks app、Lakebase データベース、Agent Bricks の AI コンポーネントを構築・deploy・改善していく実際の ワークフロー に焦点を当てています。

## Templates \{#templates\}

Templates は構成要素です。それぞれが自己完結型の Markdown prompt になっており、あなた (および coding agent) を 1 つの成果に向けて最初から最後まで導きます。

Templates には 3 つの種類があります。

### Atomic recipes \{#atomic-recipes\}

すでに構築中のシステムに機能を1つだけ追加するための、短く目的を絞ったガイドです。

* **[Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment)** — CLI をインストールし、プロファイルで認証して、ハンドシェイクをスモークテストします。すべての出発点となる手順です。
* **[Spin Up a Databricks App](/templates/spin-up-databricks-app)** — AppKit の Databricks app を新規にスキャフォールディングし、ローカルで実行して、ワークスペースに deploy します。
* **[Onboard Your Coding Agent](/templates/onboard-your-coding-agent)** — Databricks エージェントスキルをインストールし、Docs MCP server を接続して、`AGENTS.md` をブートストラップします。これにより、エージェントがワークスペースの既定値を把握できます。
* **[Volume File Manager](/templates/volume-file-upload)** — Unity Catalog Volumes を使って、アプリにファイルのアップロード、閲覧、CSV プレビューの機能を追加します。

### エンドツーエンドのウォークスルー \{#end-to-end-walkthroughs\}

複数のレシピを組み合わせて 1 つの完成したシステムを構成する、長めの prompt です。coding agent にそのまま渡せます。

* **[AI Chat App](/templates/ai-chat-app)** — Model Serving を使ったストリーミングチャット。chat history は Lakebase に永続化されます。
* **[App with Lakebase](/templates/app-with-lakebase)** — managed Postgres、schema の setup、CRUD ルートを備えた Databricks app。
* **[Genie Analytics App](/templates/genie-analytics-app)** — AI/BI Genie による対話型分析を埋め込んだ Databricks app。
* **[Lakebase Off-Platform](/templates/lakebase-off-platform)** — Databricks 外部 (Vercel、Netlify、AWS) でホストするアプリから Lakebase を利用する方法。
* **[Operational Data Analytics](/templates/operational-data-analytics)** — Unity Catalog、Lakebase Change Data Feed、運用データベースを起点とした medallion pipeline。

### サンプルアプリ \{#example-apps\}

動作するコードベースとシードデータが付属するウォークスルーです。実際のアプリを起点に、あなた (そしてあなたのエージェント) がすぐに開発を始められます。

* **[Agentic Support Console](/templates/agentic-support-console)** — Lakebase、Change Data Feed、medallion pipeline、LLM エージェント job、そして Genie 分析を埋め込んだ Databricks app。
* **[Vacation Rentals Operations Console](/templates/vacation-rentals)** — Lakebase を基盤とした flags とエージェントのメモを備えた予約キュー、SQL Warehouse による売上分析、埋め込み型の Genie チャットパネル。
* **[RAG Chat App](/templates/rag-chat)** — Wikipedia のシードコーパスを対象に、Lakebase の pgvector 検索と Model Serving による生成を組み合わせたストリーミング RAG。

すべての一覧は [templates ページ](/templates) でご覧いただけます。

## 関連ドキュメント \{#companion-docs\}

Templates は、何かを構築する *方法* を示すものです。一方ドキュメントは、その土台となるプラットフォームが *実際にどういうものか* を説明し、あなた (そしてエージェント) が根拠を持って判断できるようにします。各ページは短く、方針を明確に打ち出しています。services と コンポーネント がどう組み合わさるのかを理解するのに、過不足のない内容を目指しています。

* **[Platform overview](/docs/platform-overview)** — 社内向けアプリにおいて、Databricks Apps、Lakebase、Agent Bricks、Unity Catalog がどう組み合わさるか。
* **[Databricks Apps](/docs/apps/overview)** — アプリの deploy 先となるマネージド runtime。ワークスペース SSO、secret、そしてそれらをすべて結び付ける [AppKit](/docs/appkit/v0) TypeScript SDK を備えています。
* **[Lakebase](/docs/lakebase/overview)** — ワークスペースのデータと同じ場所に配置された managed Postgres。使いどころ、インスタンスのプロビジョニング方法、プラットフォーム内外のアプリからの接続方法。
* **[Agent Bricks](/docs/agents/overview)** — エージェントプラットフォーム。[Unity AI Gateway](/docs/agents/ai-gateway) を介した foundation-model 呼び出し、[Genie](/docs/agents/genie) による対話型分析、[custom agent](/docs/agents/custom-agents)。
* **[Tools](/docs/tools/databricks-cli)** — [Databricks CLI](/docs/tools/databricks-cli)、coding agent 向けの [エージェントスキル](/docs/tools/ai-tools/agent-skills)、そしてこのサイトのすべてのページを MCP 対応 IDE に公開する [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server)。

ガイド付きで一通り見ていきたい場合は、[/docs/start-here](/docs/start-here) から始めてください。

## coding agent への貼り付けを前提とした設計 \{#designed-to-be-pasted-into-a-coding-agent\}

開発者がソフトウェアをリリースする方法は変わりつつあり、私たちが読むコンテンツもエージェントが扱えるものである必要があります。このサイトのすべてのテンプレート (およびドキュメントページ) には、次の特徴があります。

* **コピー＆ペーストできる Markdown** — coding agent での利用を想定。
* **生の Markdown として取得可能** — 任意の URL に `.md` を付けるだけ。
* **[docs MCP server](/docs/tools/ai-tools/docs-mcp-server) 経由で利用可能** — Model Context Protocol に対応した IDE 向け。

たとえば、次のようなワークフローが効果的です。

1. developers.databricks.com でテンプレートページを開きます。
2. **Copy** ボタンを押して、ページを Markdown として取得します。
3. coding agent に貼り付け、構築手順を案内してもらいます。
4. 同じチャット内で反復します — エージェントはすでにテンプレート全体をコンテキストとして保持しています。

## はじめる \{#get-started\}

[ランディングページ](/) にアクセスして、イントロ用の prompt をコピーしてください。あとはエージェントが、Databricks Apps、Lakebase、Agent Bricks を横断するエンドツーエンドの開発ワークフローをガイドします。

このサイトは現在も拡充中です。Databricks 上で開発していて、扱ってほしいパターンがあれば、[GitHub で issue を作成してください](https://github.com/databricks/devhub/issues)。すべてに目を通しています。他の Databricks 開発者との交流は [r/databricks subreddit](https://www.reddit.com/r/databricks) でもどうぞ。

developers.databricks.com へようこそ。