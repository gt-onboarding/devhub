---
title: O que é Databricks Apps?
sidebar_label: Visão geral
description: O Databricks Apps hospeda aplicações web dentro do seu workspace, com autenticação integrada, compute gerenciado e acesso direto aos seus dados.
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
  note: "O AppKit (o SDK TypeScript) está documentado no DevHub e na skill databricks-apps. O docs.databricks.com cobre a plataforma Apps (deploy, autenticação, runtime), e não o AppKit."
---

# O que é o Databricks Apps? \{#what-is-databricks-apps\}

O Databricks Apps hospeda seu aplicativo web dentro do seu workspace. Ele ganha uma URL fixa, OAuth integrado e acesso direto aos dados e serviços do seu workspace. Sem serviço de hospedagem à parte, sem camada de autenticação para desenvolver, sem rotação de credenciais para gerenciar.

O **[AppKit](/docs/appkit/v0)** é o SDK TypeScript para criar esses aplicativos. Ele oferece componentes de interface React prontos, acesso a dados com tipagem segura e um sistema de plugins para conexão com os serviços do Databricks.

## Como funciona \{#how-it-works\}

O AppKit usa uma arquitetura de três camadas com plugins que registram funcionalidades em cada camada:

- **Client**: frontend React servido pelo Vite. O pacote `@databricks/appkit-ui` fornece tabelas de dados, gráficos, diálogos e componentes de layout.
- **Server**: servidor HTTP Express com OAuth do Databricks integrado. Os plugins registram rotas e middlewares nesta camada.
- **Data**: acesso baseado em plugins aos recursos do Databricks. Cada plugin encapsula um tipo de recurso e expõe uma API tipada no objeto `AppKit`.

| Plugin                                               | O que adiciona                                                                                                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**server**](/docs/appkit/v0/plugins/server)         | Servidor HTTP Express, entrega de arquivos estáticos, modo de desenvolvimento do Vite (sempre incluído)                                                                        |
| [**lakebase**](/docs/appkit/v0/plugins/lakebase)     | Pool de conexões Postgres para o [Lakebase Postgres](/docs/lakebase/quickstart) com renovação automática de token OAuth                                                        |
| [**analytics**](/docs/appkit/v0/plugins/analytics)   | Execução de consultas SQL em [SQL warehouses do Databricks](https://docs.databricks.com/aws/en/compute/sql-warehouse/). Consulte [Leituras analíticas](/docs/lakehouse/analytical-reads). |
| [**genie**](/docs/appkit/v0/plugins/genie)           | Integração com o [Genie Agent](/docs/agents/genie) para consultas de dados em linguagem natural                                                                                  |
| [**serving**](/docs/appkit/v0/plugins/model-serving) | Proxy autenticado para endpoints do [Model Serving](/docs/agents/ai-gateway) com suporte a streaming                                                                             |
| [**files**](/docs/appkit/v0/plugins/files)           | Operações com arquivos em [Volumes do Unity Catalog](https://docs.databricks.com/aws/en/files/)                                                                                  |
| [**agents**](/docs/appkit/v0/plugins/agents)         | Agentes de IA definidos em markdown ou código, com descoberta automática de ferramentas                                                                                          |
| [**ai-search**](/docs/appkit/v0/plugins/ai-search)   | Busca semântica e vetorial nos seus índices do AI Search                                                                                                                        |
| [**jobs**](/docs/appkit/v0/plugins/jobs)             | Acione e monitore [Databricks Lakeflow Jobs](/docs/lakehouse/jobs)                                                                                                              |
| [**caching**](/docs/appkit/v0/plugins/caching)       | Cache de respostas global e por plugin, com suporte do [Lakebase Postgres](/docs/lakebase/quickstart) quando disponível                                                          |

Para ver o conjunto completo e atualizado de plugins, consulte a [referência de plugins](/docs/appkit/v0/plugins).

## Como funciona a autenticação \{#how-auth-works\}

Todo app recebe um service principal dedicado. O Databricks injeta as credenciais dele em tempo de execução, para que seu app possa chamar as APIs do workspace sem precisar gerenciar tokens.

Por padrão, todas as requisições são executadas como esse service principal, e todos os usuários compartilham as permissões dele. Quando você precisar de acesso a dados por usuário, o Databricks pode encaminhar o token do usuário autenticado por meio do cabeçalho `x-forwarded-access-token`. Os plugins integrados do AppKit para [Genie](/docs/agents/genie) e [Model Serving](/docs/agents/ai-gateway) cuidam disso automaticamente.

## Quando usar \{#when-to-use-it\}

Apps são sobre **interatividade**, não apenas análise de dados. Um dashboard é ótimo para visualizações somente leitura com filtros predefinidos. Um app faz isso e mais: aceita entradas, executa lógica e persiste resultados. Crie um app quando seu fluxo de trabalho exigir alguma dessas capacidades — por exemplo, um construtor de cenários que salva casos criados pelo usuário ou uma ferramenta interna que substitui um processo manual em planilha.

## Quando não usar \{#when-not-to-use-it\}

- **Sites estáticos sem acesso a dados do Databricks.** Hospede-os em qualquer lugar.
- **Aplicativos públicos ou voltados ao cliente.** Por padrão, os usuários precisam ser identidades autenticadas na sua conta Databricks (não precisam pertencer ao workspace do aplicativo). Para acesso externo ou voltado ao cliente, consulte [App Users](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/key-concepts#app-users).
- **Dashboards apenas de leitura** que os [Dashboards](https://docs.databricks.com/aws/en/dashboards/) de AI/BI já cobrem. Use um dashboard até precisar persistir entradas do usuário ou executar lógica personalizada sobre elas.

## Próximos passos \{#where-to-next\}

Os [Templates](/templates) são prompts prontos para agentes, organizados por caso de uso. Encontre o que melhor se encaixa no seu cenário ou consulte o [Guia rápido de Apps](/docs/apps/quickstart) para ver um passo a passo detalhado.