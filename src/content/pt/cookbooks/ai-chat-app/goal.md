Um aplicativo de chat com IA em streaming no Databricks: o usuário envia uma mensagem, o servidor se autentica com o perfil da Databricks CLI (ou com um token de service principal em produção), chama um serving endpoint de modelo de fundação por meio do provedor compatível com OpenAI e devolve a resposta em streaming, token a token. As sessões de chat e as mensagens são persistidas no Lakebase Postgres, de modo que as conversas sobrevivem a recarregamentos da página e a novos deploys.

### Como as etapas se encaixam \{#how-the-steps-fit-together\}

Siga as etapas na ordem abaixo. Cada uma acrescenta uma peça concreta; ao final, você terá um app pronto para deploy. As Databricks agent skills instaladas fornecem os padrões de implementação de cada etapa.

1. **Spin Up a Databricks App** — faça o scaffold de um novo Databricks App com AppKit usando `databricks apps init` (o meta-prompt acima já verifica o perfil da Databricks CLI por meio de [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment)).
2. **Query Foundation Model Endpoints** — escolha um modelo de chat (por exemplo, `databricks-gpt-5-4-mini`) e configure `createOpenAI()` com a URL base `/serving-endpoints` do seu workspace.
3. **Streaming AI Chat with Model Serving** — adicione a rota `/api/chat` com `streamText()` e uma UI `useChat` apoiada por `TextStreamChatTransport`.
4. **Criar um projeto Lakebase** — provisione um projeto, branch e endpoint de managed Postgres; anote os valores de conexão.
5. **Lakebase Data Persistence** — adicione o plugin `lakebase()`, a configuração do schema e a estrutura de CRUD no seu novo projeto.
6. **Lakebase Agent Memory** — crie as tabelas `chat.chats` e `chat.messages` e persista cada turno de todas as conversas.

### Antes de começar \{#before-you-start\}

Cada etapa abaixo lista suas próprias verificações de recursos do workspace. No conjunto, o app precisa de um perfil da Databricks CLI com acesso ao Model Serving (endpoints de modelos de fundação hospedados pela Databricks), ao Lakebase Postgres e aos Databricks Apps. Faça as verificações de pré-requisitos de todas as etapas logo no início para não esbarrar em recursos bloqueados no meio do desenvolvimento.