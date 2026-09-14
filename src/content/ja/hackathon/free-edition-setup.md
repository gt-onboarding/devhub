## 1. Free Edition アカウントを作成する、または既存のアカウントを使う \{#1-create-or-use-a-free-edition-account\}

まずはこちらから: [https://www.databricks.com/learn/free-edition](https://www.databricks.com/learn/free-edition)

**Sign up for Free Edition** をクリックします。

すでに Free Edition アカウントをお持ちの場合は、Hackathon でそのアカウントを使用してかまいません。

提出物には、エンタープライズ版の Databricks ワークスペースや有償の組織アカウントを使用**しないでください**。チャレンジの公平性を保つため、各チームは Free Edition 上で構築・デモを行ってください。

## 2. 効果的な場面ではローカルで作業する \{#2-work-locally-when-it-helps\}

アプリ開発では、可能な限りローカルで反復し、定期的に Free Edition へ deploy することをおすすめします。

実践的なワークフローは次のとおりです。

* フロントエンドやアプリのコードはローカルでビルド・テストする。
* データアクセス、SQL、Model Serving、Vector Search、Lakebase、deploy 済みの Databricks App など、Databricks 固有の部分には Free Edition を使う。
* 早い段階で少なくとも一度は deploy し、その後は必要に応じてローカルでの反復と再 deploy を繰り返す。

こうすることで Free Edition のリソースを節約でき、最終的なデモを deploy 環境に近い状態に保てます。

## 3. チームで協力する \{#3-collaborate-with-your-team\}

各メンバーは自分専用の Free Edition ワークスペースを用意し、調査、プロトタイピング、ノートブック、ローカルでのアプリ開発、実験に活用してください。

プロジェクトが具体化してきたら、いずれかのメンバーの Free Edition ワークスペースをチームの**最終デモ用ワークスペース**として選びます。共有するデータセット、deploy した Databricks App、最終的なデモの状態は、このワークスペースに置きます。

推奨するチーム体制:

* 各自が個人開発用に自分の Free Edition ワークスペースを作成、または利用する。
* ソースコードは Git で管理し、ワークスペースをまたいで変更を共有できるようにする。
* 直前になって移行作業が発生しないよう、最終デモ用ワークスペースは早めに決める。
* データの確認、ノートブックの実行、アプリの deploy を手伝ってもらう必要がある場合は、メンバーを最終デモ用ワークスペースに招待する。Free Edition ワークスペースへのメンバー追加手順は[ステップバイステップの動画](https://www.youtube.com/watch?v=eA1SZvKiCfk)で確認できます。
* デモまでに、最終的な deployment の担当者を決めておく。