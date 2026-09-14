Este modelo demonstra uma ferramenta interna de moderação de conteúdo criada no Databricks: os autores enviam conteúdo para diferentes canais (blog da empresa, LinkedIn, Twitter, newsletter, comunicados à imprensa), os moderadores mantêm diretrizes específicas de cada canal e um LLM avalia cada envio de acordo com essas diretrizes antes de um revisor humano dar a palavra final.

### Fluxo de dados \{#data-flow\}

O conteúdo percorre um pipeline de revisão apoiado por Lakebase e Model Serving:

1. **Autores enviam conteúdo** ao Lakebase Postgres, especificando título, corpo e destino do conteúdo (blog, LinkedIn, etc.).
2. **A pontuação por IA** é acionada automaticamente. O servidor busca as diretrizes ativas para o destino do conteúdo, envia o conteúdo junto com as diretrizes a um Model Serving endpoint e armazena a pontuação de conformidade (0-100), os problemas sinalizados e as sugestões de melhoria.
3. **Moderadores revisam** a partir de uma fila que exibe as pontuações de IA ao lado de cada envio. Eles aprovam, rejeitam ou solicitam revisões com feedback.
4. **A gestão de diretrizes** permite que os moderadores criem e atualizem regras por destino de conteúdo. Quando as diretrizes mudam, os moderadores podem reanalisar os envios existentes.
5. **Queries no SQL Warehouse** alimentam o dashboard de análise (contagem de envios, taxas de aprovação, pontuações médias de conformidade por destino).
6. Um **Genie Agent** sobre as tabelas de moderação de conteúdo permite fazer perguntas em linguagem natural sobre o desempenho do conteúdo.

### O que adaptar \{#what-to-adapt\}

A configuração inicial e o provisionamento estão documentados no **`README.md`** do repositório.

Para personalizar este modelo:

* **Lakebase**: aponte o `databricks.yml` do app para o seu próprio projeto, branch e banco de dados Lakebase.
* **SQL Warehouse**: defina o ID do warehouse usado nas queries de análise.
* **Serving Endpoint**: defina o nome do endpoint de model serving para a análise de conteúdo por IA (por exemplo, `databricks-claude-sonnet-4-6`). A pontuação por IA é opcional; o app funciona sem ela.
* **Genie Agent**: crie um Genie Agent sobre as tabelas `content_moderation` e defina o ID do space.
* **Destinos de conteúdo**: ajuste a lista de destinos nas rotas do servidor e nos utilitários do cliente para refletir os canais de conteúdo da sua organização.
* **Diretrizes**: substitua as diretrizes iniciais pelas políticas de conteúdo reais da sua organização.
* **Dados iniciais**: o script de seed cria 7 diretrizes, 10 envios de exemplo e 5 revisões. Substitua por seus próprios dados ou use o formulário de envio do app.