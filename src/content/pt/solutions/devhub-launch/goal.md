Hello World, developers.databricks.com!

Estamos lançando o **developers.databricks.com**, um site para desenvolvedores que criam aplicativos internos no workspace do Databricks que sua empresa já utiliza.

Se sua equipe já tem dados no Databricks e quer construir algo em cima deles — um chat sobre sua documentação, uma ferramenta interna agêntica, um frontend de análise —, este site é o caminho mais curto entre uma pasta vazia e um aplicativo implantado.

## Por que criamos isso \{#why-we-built-this\}

Somos engenheiros e queríamos o tipo de material que gostaríamos de ter tido quando começamos a desenvolver no Databricks: focado em código, com opiniões claras e curto o suficiente para ser lido de ponta a ponta. A documentação oficial do Databricks é abrangente e feita para um público amplo. O developers.databricks.com é o complemento voltado para desenvolvedores — pronto para copiar e colar, amigável a agentes de IA e focado nos workflows reais de criar, fazer deploy e iterar em apps do Databricks, bancos de dados Lakebase e componentes de IA do Agent Bricks.

## Modelos \{#templates\}

Os modelos são os blocos de construção. Cada um é um prompt em markdown autocontido que guia você (e seu agente de programação) por um resultado completo, do início ao fim.

Os modelos vêm em três variações.

### Receitas atômicas \{#atomic-recipes\}

Guias curtos e de propósito único para adicionar um recurso a um sistema que você já está construindo:

* **[Configure seu ambiente de desenvolvimento local](/templates/set-up-your-local-dev-environment)** — instale a CLI, autentique um perfil e faça um teste rápido do handshake. O ponto de partida para todo o resto.
* **[Crie um app do Databricks](/templates/spin-up-databricks-app)** — faça o scaffold de um novo app do Databricks com AppKit, execute-o localmente e faça o deploy para o seu workspace.
* **[Prepare seu agente de programação](/templates/onboard-your-coding-agent)** — instale as agent skills do Databricks, conecte o Docs MCP Server e crie um `AGENTS.md` inicial para que seu agente conheça os padrões do seu workspace.
* **[Gerenciador de arquivos de Volume](/templates/volume-file-upload)** — adicione upload de arquivos, navegação e prévia de CSV ao seu app por meio dos Volumes do Unity Catalog.

### Guias de ponta a ponta \{#end-to-end-walkthroughs\}

Prompts mais longos que combinam várias receitas em um sistema completo, prontos para entregar a um agente de programação:

* **[App de Chat com IA](/templates/ai-chat-app)** — chat com streaming sobre Model Serving, com o histórico de conversas persistido no Lakebase.
* **[App com Lakebase](/templates/app-with-lakebase)** — um app do Databricks com Postgres gerenciado, configuração de schema e rotas CRUD.
* **[App de Analytics com Genie](/templates/genie-analytics-app)** — um app do Databricks com analytics conversacional incorporado, com tecnologia do AI/BI Genie.
* **[Lakebase Fora da Plataforma](/templates/lakebase-off-platform)** — uso do Lakebase a partir de apps hospedados fora do Databricks (Vercel, Netlify, AWS).
* **[Analytics de Dados Operacionais](/templates/operational-data-analytics)** — Unity Catalog, Lakebase Change Data Feed e um pipeline medalhão a partir do seu banco de dados operacional.

### Apps de exemplo \{#example-apps\}

Guias passo a passo que já vêm com uma base de código funcional e dados iniciais, para que você (e seu agent) possa partir de um app real:

* **[Agentic Support Console](/templates/agentic-support-console)** — Lakebase, Change Data Feed, um pipeline medalhão, um job de agent com LLM e um app do Databricks com analytics do Genie incorporado.
* **[Vacation Rentals Operations Console](/templates/vacation-rentals)** — fila de reservas com flags e notas de agent apoiadas pelo Lakebase, analytics de receita com SQL warehouse e um painel de chat do Genie incorporado.
* **[RAG Chat App](/templates/rag-chat)** — RAG com streaming sobre um corpus inicial da Wikipédia, com recuperação via pgvector no Lakebase e geração com Model Serving.

Veja todos na [página de modelos](/templates).

## Documentação complementar \{#companion-docs\}

Os modelos mostram *como* construir algo. A documentação explica *o que* é, de fato, a plataforma por trás disso, para que você (e seu agente) possam tomar decisões bem fundamentadas. Cada página é curta e direta ao ponto. A ideia é dar o suficiente para você entender como os serviços e componentes se encaixam.

* **[Platform overview](/docs/platform-overview)** — como apps do Databricks, Lakebase, Agent Bricks e Unity Catalog se encaixam em um app interno.
* **[App do Databricks](/docs/apps/overview)** — o runtime gerenciado no qual seu app do Databricks é implantado, com SSO do workspace, secrets e o SDK TypeScript do [AppKit](/docs/appkit/v0) que conecta tudo isso.
* **[Lakebase](/docs/lakebase/overview)** — Postgres gerenciado co-localizado com os dados do seu workspace: quando usar, como provisionar uma instância e como se conectar a partir de apps dentro e fora da plataforma.
* **[Agent Bricks](/docs/agents/overview)** — a plataforma de agentes: chamadas a modelos de fundação pelo [Unity AI Gateway](/docs/agents/ai-gateway), análises conversacionais com o [Genie](/docs/agents/genie) e [custom agents](/docs/agents/custom-agents).
* **[Ferramentas](/docs/tools/databricks-cli)** — a [Databricks CLI](/docs/tools/databricks-cli), as [agent skills](/docs/tools/ai-tools/agent-skills) para seu agente de programação e o [Docs MCP server](/docs/tools/ai-tools/docs-mcp-server), que expõe todas as páginas deste site para IDEs compatíveis com MCP.

Comece em [/docs/start-here](/docs/start-here) se quiser o tour guiado.

## Feito para ser colado em um agente de programação \{#designed-to-be-pasted-into-a-coding-agent\}

A forma como os desenvolvedores entregam software está mudando, e o conteúdo que lemos também precisa funcionar para os nossos agentes. Todo modelo (e página de documentação) do site é:

* **Markdown pronto para copiar e colar**, feito para ser usado por um agente de programação.
* **Disponível como markdown puro**, basta adicionar `.md` ao final de qualquer URL.
* **Acessível pelo nosso [docs MCP server](/docs/tools/ai-tools/docs-mcp-server)**, para IDEs compatíveis com o Model Context Protocol.

Um workflow que funciona bem:

1. Abra a página de um modelo em developers.databricks.com.
2. Clique no botão **Copiar** para obter a página em markdown.
3. Cole no seu agente de programação e deixe que ele guie você pela construção.
4. Itere no mesmo chat — o agente já tem o modelo completo como contexto.

## Comece agora \{#get-started\}

Acesse a [página inicial](/) e copie o prompt de introdução. A partir daí, seu agent vai guiá-lo por um fluxo de desenvolvimento completo, de ponta a ponta, envolvendo Databricks Apps, Lakebase e Agent Bricks.

Estamos expandindo o site continuamente. Se você desenvolve no Databricks e quer ver algum padrão abordado por aqui, [abra uma issue no GitHub](https://github.com/databricks/devhub/issues) — lemos todas. Você também pode participar das conversas com outros desenvolvedores Databricks no [subreddit r/databricks](https://www.reddit.com/r/databricks).

Boas-vindas ao developers.databricks.com.