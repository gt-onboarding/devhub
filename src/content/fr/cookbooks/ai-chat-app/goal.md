Une application de chat IA en streaming sur Databricks : l&#39;utilisateur envoie un message, le serveur s&#39;authentifie via le profil CLI Databricks (ou un token de service principal en production), appelle un serving endpoint de foundation-model par l&#39;intermédiaire du fournisseur compatible OpenAI, puis renvoie la réponse en streaming, token par token. Les sessions de chat et les messages sont conservés dans Lakebase Postgres, de sorte que les conversations résistent aux actualisations de page et aux redéploiements.

### Comment les étapes s&#39;articulent \{#how-the-steps-fit-together\}

Suivez les étapes dans l&#39;ordre ci-dessous. Chacune apporte un élément concret ; à l&#39;arrivée, vous disposez d&#39;une application déployable. Les Databricks agent skills que vous avez installées fournissent les modèles d&#39;implémentation propres à chaque étape.

1. **Lancer une Databricks App** — générez l&#39;ossature d&#39;une nouvelle Databricks App AppKit avec `databricks apps init` (le méta-prompt ci-dessus vérifie déjà le CLI profile via [Configurer votre environnement de développement local](/templates/set-up-your-local-dev-environment)).
2. **Interroger des endpoints de foundation models** — choisissez un modèle de chat (par exemple `databricks-gpt-5-4-mini`) et branchez `createOpenAI()` sur l&#39;URL de base `/serving-endpoints` de votre workspace.
3. **Chat IA en streaming avec Model Serving** — ajoutez la route `/api/chat` avec `streamText()` et une interface `useChat` reposant sur `TextStreamChatTransport`.
4. **Créer un projet Lakebase** — provisionnez un projet managed Postgres, une branch et un endpoint ; relevez les valeurs de connexion.
5. **Persistance des données avec Lakebase** — ajoutez le plugin `lakebase()`, la configuration du schéma et la mécanique CRUD sur votre nouveau projet.
6. **Mémoire d&#39;agent Lakebase** — créez les tables `chat.chats` et `chat.messages` et persistez chaque tour de chaque conversation.

### Avant de commencer \{#before-you-start\}

Chaque étape ci-dessous précise les fonctionnalités du workspace à vérifier. Au total, l&#39;application nécessite un profil CLI Databricks ayant accès à Model Serving (endpoints de foundation-model hébergés par Databricks), à Lakebase Postgres et à Databricks Apps. Effectuez ces vérifications de prérequis en amont pour ne pas buter sur une fonctionnalité restreinte en plein développement.