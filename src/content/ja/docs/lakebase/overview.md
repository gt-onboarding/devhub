---
title: Lakebase Postgres とは
sidebar_label: 概要
description: Lakebase Postgres は、Databricks 内で提供されるマネージド Postgres で、Lakehouse と同一環境に配置されます。即時の branching とオートスケーリングに対応した OLTP ストレージです。
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/
---

# Lakebase Postgres とは \{#what-is-lakebase-postgres\}

Lakebase Postgres は、Databricks ワークスペース内で動作するマネージド PostgreSQL で、ワークスペースのデータやサービスと同じ場所に配置されます。

アプリが低レイテンシで頻繁に読み書きするデータに使用します。ユーザー状態、セッション、チャット履歴、ログなどを、Lakehouse の分析データと同じ場所に保存できます。

このページは Lakebase を AppKit の観点から説明したものです。Lakebase Postgres 自体（プロジェクト、branching、オートスケーリング、接続）については、[Lakebase のドキュメント](https://docs.databricks.com/aws/en/oltp/) または [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) エージェントスキルを参照してください。

## 自前で運用する Postgres との違い \{#what-makes-it-different-from-running-your-own-postgres\}

- **ワークスペース内で動作**するため、VPC ピアリングやクラウドをまたぐ認証情報の管理が不要になり、ネットワークレイテンシも解消されます。
- **即時の branching**：コピーオンライト方式のストレージにより、git の branch と同じように、分離されたデータベースのコピーを数秒で作成できます。branch は変更のないデータを共有するため、作成も維持も低コストです。
- **オートスケール**：設定した最小／最大の範囲内で、負荷に応じてスケールアップし、需要が減ればスケールダウンします。キャパシティプランニングや手動でのサイズ変更は不要です。
- **ゼロスケール**：アイドル時はゼロまで縮小し、次のクエリで再開します。アイドル状態の compute に対する料金は発生しません。非アクティブタイムアウトは既定で 24 時間、60 秒から 7 日の範囲で設定できます。

## AppKit による接続の仕組み \{#how-appkit-wires-it-up\}

`createApp` に `lakebase()` プラグインを追加すると、OAuth トークンを自動でリフレッシュする `pg.Pool` がプラグインによってセットアップされます。

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// 標準的な pg.Pool のクエリ
const { rows } = await AppKit.lakebase.query("SELECT * FROM app.items");

// ORM ですぐに使える設定（Drizzle、Prisma など）
const ormConfig = AppKit.lakebase.getOrmConfig();
```

このプラグインは、OAuthトークンのリフレッシュとコネクションプーリングを自動的に処理します。デプロイ時には、プラットフォームが接続情報を環境変数として注入し、プラグインがそれを読み取ります。手動での設定は不要です。プールの設定オプションとAPIの詳細については、[AppKit `lakebase` プラグインリファレンス](/docs/appkit/v0/plugins/lakebase)を参照してください。


## 利用に適したケース \{#when-to-use-it\}

- アプリで低レイテンシの読み書きが必要な場合: ユーザー状態、セッション、会話履歴、トランザクションレコードなど。
- 永続的なメモリを必要とするAIエージェントを構築する場合: リクエストをまたいだ会話履歴、ワークフロー状態、ツールの実行結果など。
- 機能開発やCIテスト向けに、分離されたデータベースbranchを使いたい場合。
- 変更データキャプチャ（CDC）によって、OLTPワークロードと[Data Lakehouse](/docs/lakehouse/overview)の間でデータを同期する場合。

## 使用すべきでないケース \{#when-not-to-use-it\}

- 純粋な分析用途: 大規模データセットに対する読み取り専用クエリは、Lakebase Postgres ではなく Unity Catalog で扱うべきです。
- Databricks ワークスペースに他の依存関係を持たないアプリ。コロケーションの利点が活かせないうえ、認証は自前で実装する必要があります (ワークスペース外で動作するアプリには、Databricks が資格情報を注入したりトークンを更新したりすることはありません)。

## 次のステップ \{#where-to-next\}

[テンプレート](/templates)は、ユースケース別に整理されたエージェント対応のプロンプトです。目的に合うものを探すか、手順を追って進めたい場合は[Lakebase Postgres クイックスタート](/docs/lakebase/quickstart)を参照してください。