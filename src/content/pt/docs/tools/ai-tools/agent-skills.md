---
title: Habilidades de agentes
sourceOfTruth:
  skills:
    - databricks-core
  docs:
    - https://github.com/databricks/databricks-agent-skills
---

# Agent skills \{#agent-skills\}

Agent skills são arquivos de instruções que os assistentes de programação com IA carregam para executar tarefas de desenvolvimento no Databricks. A Databricks publica suas skills no repositório [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) e segue o padrão aberto [agent skills standard](https://agentskills.io/).

As skills explicam ao seu agente de programação como o Databricks funciona, incluindo convenções da CLI, padrões de autenticação e nomes de recursos, de modo que ele gere o código correto em vez de adivinhar.

## Instalação \{#install\}

Instale as agent skills oficiais do Databricks com o seguinte comando:

```bash title="Common"
databricks aitools install
```

```bash title="All Options"
databricks aitools install \
  --scope $SCOPE \
  --agents $AGENTS \
  --skills $SKILLS \
  --skills-only \
  --path $OUTPUT_DIR \
  --experimental \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

:::note
É necessário ter a Databricks CLI instalada. Consulte [Databricks CLI](/docs/tools/databricks-cli) para obter instruções de instalação.
:::

A CLI detecta quais agentes de programação você tem instalados. Para agentes com suporte a plugins (Claude Code, Codex CLI, GitHub Copilot), ela instala o plugin `databricks` por meio da CLI do próprio agente. Os agentes sem instalação de plugin em modo headless (Cursor, OpenCode, Antigravity) recebem arquivos de skill brutos vinculados a partir de um local compartilhado (`~/.databricks/aitools/skills/`).

Opções de `databricks aitools install`:

<!-- cli-options:aitools install -->

| Opção             | Descrição                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `--agents`        | Agentes para os quais instalar (separados por vírgula, ex.: claude-code,cursor)          |
| `--experimental`  | Incluir skills experimentais                                                             |
| `--path`          | Gravar os arquivos de skill resolvidos neste diretório (sem agentes, sem estado)         |
| `--scope`         | Escopo de instalação: project ou global (padrão: global, ou pergunta no modo interativo) |
| `--skills`        | Skills específicas a instalar (separadas por vírgula)                                    |
| `--skills-only`   | Forçar arquivos de skill brutos para todos os agentes em vez do plugin                   |
| `--debug`         | ativar registro de depuração                                                             |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text)                                                |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                               |
| `--target`, `-t`  | bundle target a ser usado (se aplicável)                                                 |

<!-- /cli-options -->

Observe que `--skills-only` e `--path` não podem ser usados juntos.


## Gerenciar \{#manage\}

```bash title="List, update, or remove skills"
databricks aitools list
databricks aitools update
databricks aitools uninstall
```

`update` busca a versão mais recente e instala automaticamente novas skills. Use `--check` para pré-visualizar sem baixar, `--no-new` para pular a instalação automática de novas skills, `--no-prune` para manter skills que foram removidas do manifesto ou `--force` para baixar novamente mesmo que as versões coincidam.

`uninstall` remove os arquivos do plugin ou da skill. Use `--keep-marketplace` para manter o registro no marketplace ao remover um plugin.

Todos os comandos aceitam `--scope` para controlar o escopo: `install` e `uninstall` aceitam `project` ou `global`; `update` e `list` também aceitam `both` (o padrão de `list` é `both`).


## Métodos alternativos de instalação \{#alternative-install-methods\}

Você também pode instalar as skills do Databricks com a [Skills CLI](https://github.com/vercel-labs/skills) (por exemplo, `npx skills add databricks/databricks-agent-skills`) ou diretamente pelo chat do Cursor, com `/add-plugin databricks`. Ainda assim, `databricks aitools install` é o método recomendado — ele é mantido pela Databricks e sempre instala as versões estáveis mais recentes.

## Skills disponíveis \{#available-skills\}

Execute `databricks aitools list` para ver as skills disponíveis e o status de instalação de cada uma.

<!-- aitools-skills -->

| Habilidade                               | Descrição                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-agent-bricks`                | Crie Knowledge Assistants (KA) do Agent Bricks para perguntas e respostas sobre documentos e Supervisor Agents para orquestração multiagente (MAS).                                                                                                                                                                                                                                                              |
| `databricks-ai-functions`                | Use as funções de IA integradas do Databricks (ai&#95;classify, ai&#95;extract, ai&#95;summarize, ai&#95;mask, ai&#95;translate, ai&#95;fix&#95;grammar, ai&#95;gen, ai&#95;analyze&#95;sentiment, ai&#95;similarity, ai&#95;parse&#95;document, ai&#95;prep&#95;search, ai&#95;query, ai&#95;forecast) para adicionar recursos de IA diretamente a pipelines SQL e PySpark, sem gerenciar endpoints de modelos. |
| `databricks-aibi-dashboards`             | Crie painéis de IA/BI do Databricks.                                                                                                                                                                                                                                                                                                                                                                             |
| `databricks-app-design`                  | Projete a UX de telas de dados para Databricks Apps com código personalizado (AppKit/React) — páginas de KPI/visão geral, relatórios, gráficos, tabelas e assistentes de dados Genie/chat — usando componentes específicos do AppKit.                                                                                                                                                                            |
| `databricks-apps`                        | Crie apps na plataforma Databricks Apps.                                                                                                                                                                                                                                                                                                                                                                         |
| `databricks-apps-python`                 | Backend em Python para Databricks Apps — FastAPI (padrão), Flask, Dash, Streamlit, Gradio, Reflex. **O padrão para um novo Databricks App é `databricks-apps` (AppKit — Node/TypeScript/React) — use-o primeiro.** Use esta skill apenas quando o usuário pedir um backend em Python, estender um app Python existente ou quando a equipe trabalhar somente com Python.                                          |
| `databricks-core`                        | Operações do Databricks CLI e habilidade principal/ponto de entrada para uso do Databricks CLI: autenticação, seleção de perfis e bundles.                                                                                                                                                                                                                                                                       |
| `databricks-dabs`                        | Crie, configure, valide, implante, execute e gerencie Declarative Automation Bundles (DABs, anteriormente Databricks Asset Bundles).                                                                                                                                                                                                                                                                             |
| `databricks-data-discovery`              | Descubra, explore e consulte dados do Databricks com o Genie — o equivalente em CLI do Genie One MCP.                                                                                                                                                                                                                                                                                                            |
| `databricks-dbsql`                       | Recursos avançados e funcionalidades de SQL warehouse do Databricks SQL (DBSQL).                                                                                                                                                                                                                                                                                                                                 |
| `databricks-docs`                        | Referência da documentação do Databricks por meio do índice llms.txt.                                                                                                                                                                                                                                                                                                                                            |
| `databricks-execution-compute`           | Execute código e gerencie compute no Databricks: execute Python/Scala/SQL/R em clusters sem servidor, clássicos ou interativos e crie/redimensione/exclua clusters e SQL warehouses.                                                                                                                                                                                                                             |
| `databricks-iceberg`                     | Tabelas Apache Iceberg no Databricks — tabelas Iceberg gerenciadas, leituras externas do Iceberg (anteriormente Uniform), modo de compatibilidade, catálogo REST do Iceberg (IRC), Iceberg v3, interoperabilidade com Snowflake, PyIceberg, Spark OSS, acesso a mecanismos externos e fornecimento de credenciais.                                                                                               |
| `databricks-jobs`                        | Desenvolva e implante Lakeflow Jobs no Databricks usando DABs, o SDK do Python ou a CLI.                                                                                                                                                                                                                                                                                                                         |
| `databricks-lakebase`                    | Databricks Lakebase Postgres: projetos, escalonamento, conectividade, tabelas sincronizadas do Lakebase e API de dados.                                                                                                                                                                                                                                                                                          |
| `databricks-lakeflow-connect`            | Crie pipelines de ingestão gerenciados no Databricks usando o Lakeflow Connect.                                                                                                                                                                                                                                                                                                                                  |
| `databricks-metric-views`                | Visualizações de métricas do Unity Catalog: defina, crie, consulte e gerencie métricas de negócios governadas em YAML.                                                                                                                                                                                                                                                                                           |
| `databricks-ml-training`                 | Treine modelos de ML no Databricks.                                                                                                                                                                                                                                                                                                                                                                              |
| `databricks-mlflow-evaluation`           | Avaliação de agentes de GenAI com o MLflow 3.                                                                                                                                                                                                                                                                                                                                                                    |
| `databricks-model-serving`               | Ciclo de vida e operações de endpoints do Model Serving do Databricks.                                                                                                                                                                                                                                                                                                                                           |
| `databricks-pipelines`                   | Desenvolva Lakeflow Spark Declarative Pipelines (anteriormente Delta Live Tables) no Databricks.                                                                                                                                                                                                                                                                                                                 |
| `databricks-python-sdk`                  | Orientações de desenvolvimento para Databricks, incluindo o SDK do Python, Databricks Connect, CLI e API REST.                                                                                                                                                                                                                                                                                                   |
| `databricks-serverless-migration`        | Migre cargas de trabalho do Databricks da computação clássica para a computação sem servidor.                                                                                                                                                                                                                                                                                                                    |
| `databricks-spark-structured-streaming`  | Guia completo do Spark Structured Streaming para cargas de trabalho de produção.                                                                                                                                                                                                                                                                                                                                 |
| `databricks-synthetic-data-gen`          | Gere dados sintéticos realistas usando Spark + Faker (altamente recomendado).                                                                                                                                                                                                                                                                                                                                    |
| `databricks-unity-catalog`               | Governança, controle de acesso e observabilidade no Unity Catalog.                                                                                                                                                                                                                                                                                                                                               |
| `databricks-unstructured-pdf-generation` | Crie conjuntos de dados para avaliação de RAG em documentos não estruturados e documentos de demonstração (por exemplo, para o Knowledge Assistant) no Databricks: gere PDFs sintéticos localmente, faça upload deles para volumes do Unity Catalog e associe cada documento a perguntas de teste para avaliar a recuperação.                                                                                    |
| `databricks-vector-search`               | Endpoints e índices do Databricks Vector Search para RAG e pesquisa semântica; abrange tipos de índice, modos de pesquisa e padrões de RAG de ponta a ponta                                                                                                                                                                                                                                                      |
| `databricks-zerobus-ingest`              | Crie clientes Zerobus Ingest para ingestão de dados quase em tempo real em tabelas Delta do Databricks via gRPC.                                                                                                                                                                                                                                                                                                 |

<!-- /aitools-skills -->

As skills a seguir são experimentais. Instale-as adicionando `--experimental` ao comando `databricks aitools install`:

<!-- aitools-skills-experimental -->

| Skill                      | Descrição                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-ai-runtime`    | CLI do Databricks AI Runtime (`air`) — a ferramenta de linha de comando para enviar e gerenciar cargas de trabalho de treinamento em GPU no compute serverless do Databricks. |
| `databricks-genie`         | Crie e consulte Genie Spaces do Databricks para exploração de SQL em linguagem natural.                                                                 |
| `spark-python-data-source` | Crie fontes de dados Python personalizadas para o Apache Spark com a API DataSource do PySpark — leitores/gravadores em lote e de streaming para sistemas externos. |

<!-- /aitools-skills-experimental -->

## Próximos passos \{#where-to-next\}

Com as agent skills do Databricks instaladas, seu agente de programação tem o contexto necessário para desenvolver e implantar.

- Para dar ainda mais contexto ao seu agente, instale o [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server).
- Tudo pronto para começar? Veja como os [templates](/docs/templates) ajudam a fazer o scaffold do seu projeto rapidamente.