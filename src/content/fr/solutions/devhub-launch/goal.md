Hello World, developers.databricks.com !

Nous lançons **developers.databricks.com**, un site destiné aux développeurs qui créent des applications internes sur le workspace Databricks que votre entreprise utilise déjà.

Si votre équipe dispose déjà de données dans Databricks et que vous souhaitez bâtir quelque chose par-dessus — un chat sur votre documentation, un outil interne agentique, une interface d&#39;analytique — ce site est le chemin le plus court entre un dossier vide et une application déployée.

## Pourquoi nous avons créé cette ressource \{#why-we-built-this\}

Nous sommes des ingénieurs, et nous voulions la ressource que nous aurions aimé avoir à nos débuts sur Databricks : orientée code, avec des partis pris assumés, et assez concise pour être lue de bout en bout. La documentation officielle de Databricks est exhaustive et s&#39;adresse à un large public. developers.databricks.com en est le pendant destiné aux développeurs : du code prêt à copier-coller, pensé pour les agents IA, et centré sur les flux de travail réels de création, de déploiement et d&#39;itération sur les Databricks Apps, les bases de données Lakebase et les composants IA Agent Bricks.

## Modèles \{#templates\}

Les modèles sont les briques de base. Chacun est un prompt markdown autonome qui vous guide, vous et votre agent de codage, de bout en bout vers un résultat précis.

Les modèles se déclinent en trois variantes.

### Recettes atomiques \{#atomic-recipes\}

Guides courts et ciblés, dédiés à l&#39;ajout d&#39;une seule capacité à un système que vous développez déjà :

* **[Configurer votre environnement de développement local](/templates/set-up-your-local-dev-environment)** — installez la CLI, authentifiez un profil, vérifiez rapidement la connexion. Le point de départ de tout le reste.
* **[Lancer une Databricks App](/templates/spin-up-databricks-app)** — générez l&#39;ossature d&#39;une nouvelle Databricks app AppKit, exécutez-la en local et déployez-la dans votre workspace.
* **[Intégrer votre agent de codage](/templates/onboard-your-coding-agent)** — installez les Databricks agent skills, branchez le serveur MCP Docs et initialisez un fichier `AGENTS.md` pour que votre agent connaisse les valeurs par défaut de votre workspace.
* **[Gestionnaire de fichiers de volume](/templates/volume-file-upload)** — ajoutez le téléversement de fichiers, la navigation et l&#39;aperçu CSV à votre app via les Unity Catalog Volumes.

### Parcours de bout en bout \{#end-to-end-walkthroughs\}

Des prompts plus longs qui combinent plusieurs recettes en un système complet, prêt à être confié à un agent de codage :

* **[AI Chat App](/templates/ai-chat-app)** — chat en streaming via Model Serving, avec l&#39;historique des conversations persisté dans Lakebase.
* **[App with Lakebase](/templates/app-with-lakebase)** — une Databricks App avec managed Postgres, la configuration du schema et des routes CRUD.
* **[Genie Analytics App](/templates/genie-analytics-app)** — une Databricks App intégrant de l&#39;analytique conversationnelle propulsée par AI/BI Genie.
* **[Lakebase Off-Platform](/templates/lakebase-off-platform)** — utiliser Lakebase depuis des applications hébergées en dehors de Databricks (Vercel, Netlify, AWS).
* **[Operational Data Analytics](/templates/operational-data-analytics)** — Unity Catalog, le Change Data Feed de Lakebase et un pipeline medallion alimenté par votre base de données opérationnelle.

### Exemples d&#39;applications \{#example-apps\}

Des guides pas à pas fournis avec une base de code fonctionnelle et des données de départ, pour que vous (et votre agent) puissiez partir d&#39;une véritable application :

* **[Agentic Support Console](/templates/agentic-support-console)** — Lakebase, Change Data Feed, un pipeline medallion, un job d&#39;agent LLM et une Databricks App avec analyses Genie intégrées.
* **[Vacation Rentals Operations Console](/templates/vacation-rentals)** — file d&#39;attente de réservations avec indicateurs et notes d&#39;agent stockés dans Lakebase, analyses de revenus via SQL Warehouse et panneau de discussion Genie intégré.
* **[RAG Chat App](/templates/rag-chat)** — RAG en streaming sur un corpus de départ Wikipédia, avec récupération pgvector depuis Lakebase et génération via Model Serving.

Découvrez-les tous sur la [page des modèles](/templates).

## Documentation complémentaire \{#companion-docs\}

Les modèles vous montrent *comment* construire quelque chose. La documentation explique *ce qu&#39;est* réellement la plateforme sous-jacente, afin que vous (et votre agent) puissiez prendre des décisions éclairées. Chaque page est courte et assume ses partis pris. L&#39;objectif est d&#39;en dire juste assez pour que vous compreniez comment les services et les composants s&#39;articulent.

* **[Vue d&#39;ensemble de la plateforme](/docs/platform-overview)** — comment Databricks Apps, Lakebase, Agent Bricks et Unity Catalog s&#39;articulent dans une application interne.
* **[Databricks Apps](/docs/apps/overview)** — le runtime managé sur lequel votre application est déployée, avec le SSO du workspace, les secrets et le SDK TypeScript [AppKit](/docs/appkit/v0) qui relie le tout.
* **[Lakebase](/docs/lakebase/overview)** — le Postgres managé colocalisé avec les données de votre workspace : quand l&#39;utiliser, comment provisionner une instance et comment s&#39;y connecter depuis des applications internes ou externes à la plateforme.
* **[Agent Bricks](/docs/agents/overview)** — la plateforme d&#39;agents : appels aux modèles de fondation via [Unity AI Gateway](/docs/agents/ai-gateway), analytique conversationnelle avec [Genie](/docs/agents/genie) et [custom agents](/docs/agents/custom-agents).
* **[Outils](/docs/tools/databricks-cli)** — le [CLI Databricks](/docs/tools/databricks-cli), les [agent skills](/docs/tools/ai-tools/agent-skills) destinées à votre agent de codage, et le [serveur MCP Docs](/docs/tools/ai-tools/docs-mcp-server) qui expose chaque page de ce site aux IDE compatibles MCP.

Commencez par [/docs/start-here](/docs/start-here) si vous souhaitez une visite guidée.

## Conçu pour être collé dans un agent de codage \{#designed-to-be-pasted-into-a-coding-agent\}

La façon dont les développeurs déploient des logiciels évolue, et le contenu que nous lisons doit aussi fonctionner pour nos agents. Chaque modèle (et chaque page de documentation) du site est :

* **Du markdown prêt à copier-coller**, destiné à être utilisé par un agent de codage.
* **Disponible en markdown brut**, en ajoutant `.md` à n&#39;importe quelle URL.
* **Accessible via notre [serveur MCP Docs](/docs/tools/ai-tools/docs-mcp-server)** pour les IDE compatibles avec le Model Context Protocol.

Un flux de travail efficace :

1. Ouvrez la page d&#39;un modèle sur developers.databricks.com.
2. Cliquez sur le bouton **Copy** pour récupérer la page en markdown.
3. Collez-la dans votre agent de codage et laissez-le vous guider tout au long du développement.
4. Itérez dans la même conversation — l&#39;agent dispose déjà du modèle complet comme contexte.

## Démarrer \{#get-started\}

Rendez-vous sur la [page d&#39;accueil](/) et copiez le prompt d&#39;introduction. Votre agent vous guidera ensuite tout au long d&#39;un flux de travail de développement de bout en bout couvrant Databricks Apps, Lakebase et Agent Bricks.

Nous enrichissons le site en continu. Si vous développez sur Databricks et qu&#39;un pattern vous semble manquer, [ouvrez une issue sur GitHub](https://github.com/databricks/devhub/issues) — nous les lisons toutes. Vous pouvez également échanger avec d&#39;autres développeurs Databricks sur le [subreddit r/databricks](https://www.reddit.com/r/databricks).

Bienvenue sur developers.databricks.com.