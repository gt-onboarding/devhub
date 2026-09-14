---
title: はじめに
description: すでに社内で稼働している Databricks workspace 上で、社内向けアプリを構築できます。DevHub では、テンプレート、AppKit SDK、関連ドキュメントを提供しています。
sourceOfTruth:
  skills:
    - databricks-core
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# はじめに \{#start-here\}

## DevHub とは \{#what-is-devhub\}

DevHub は、Databricks で**エンタープライズアプリ**を構築するための開発者向けリソースです。

## なぜ Databricks でエンタープライズアプリを構築するのか \{#why-enterprise-apps-on-databricks\}

Databricks プラットフォームは、優れた開発者体験と、大規模組織が求める本番運用への対応力およびガバナンスを兼ね備えています。

* **開発者体験**: エージェントファーストのツールにより、コーディングエージェントが面倒な作業を引き受け、誰でも実用的なアプリを素早くリリースできます。
* **本番運用への対応力**: 追加設定なしで安定したマネージドデプロイを利用でき、ダウンタイムゼロのロールアウトとセッションアフィニティを備えた水平スケーリングにも対応します。
* **ガバナンスと管理**: workspace レベルの権限と SSO がすべてのアプリに自動的に適用され、アプリ単位の compute 制御 (固定サイズ、オンデマンドでの停止・起動) によってコストを抑えられます。

## workspace がすべての基盤 \{#your-workspace-is-the-foundation\}

Databricks 上で構築するアプリは、**Databricks workspace** 上で実行されます。

> workspace がどういうものか分からない場合は、チームの Databricks 管理者に問い合わせるか、[無料トライアル](https://databricks.com/signup)に登録するか、[Databricks Free Edition](https://databricks.com/learn/free-edition) で自分専用の workspace を作成してください。

workspace は分離され、セキュアで、ガバナンスが効いた環境です。構築するアプリごとに、誰がサインインできるか、アプリがどのデータを読み書きできるかを決めるのは workspace です。ホスティング、認証、ネットワークはすべて自動的に処理されるため、インフラではなくアプリの中核となるロジックに集中できます。

## 利用するサービス \{#what-youll-build-with\}

Databricks 上に構築するアプリでは、[Databricks Apps](/ja/docs/apps/overview)、[Lakebase Postgres](/ja/docs/lakebase/overview)、[Agent Bricks](/ja/docs/agents/overview)、[Data Lakehouse](/ja/docs/lakehouse/overview) など、複数の workspace サービスを利用します。各サービスの詳細は [プラットフォーム概要](/ja/docs/platform-overview) を参照してください。

## 次のステップ \{#where-to-go-next\}

* [プラットフォーム概要](/ja/docs/platform-overview)で、各サービスがどのように連携するかを確認する。
* [環境をセットアップ](/ja/docs/tools/databricks-cli)して、アプリの構築を始める。
* [テンプレート](/ja/docs/templates)とは何か、アプリの雛形を素早く作成するのにどう役立つかを学ぶ。