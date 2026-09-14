## Prompt \{#prompt\}

Você recebe 10.000 registros desorganizados de unidades de saúde em toda a Índia. Cada registro inclui campos estruturados, como localização e especialidades, além de descrições em texto livre, de qualidade irregular, sobre capacidades, procedimentos, equipamentos e serviços declarados.

Crie um Databricks App que ajude um planejador de saúde sem perfil técnico, um coordenador de ONG ou um analista a transformar esses dados desorganizados em decisões confiáveis.

Seu app deve extrair estrutura útil dos registros, apresentar evidências que sustentem suas conclusões, comunicar a incerteza de forma honesta e permitir que os usuários salvem ou revisem seu trabalho.

## Requisitos essenciais \{#core-requirements\}

Sua submissão deve:

* Ser executada como um Databricks App na Free Edition.
* Usar o dataset de unidades de saúde fornecido.
* Dar suporte a um fluxo de trabalho claro para usuários não técnicos.
* Citar o texto original da unidade de saúde em qualquer afirmação, recomendação, pontuação ou classificação relevante.
* Comunicar incertezas em vez de apresentar evidências fracas como fatos.
* Persistir ações do usuário, como notas, substituições manuais, listas de selecionados, cenários ou decisões de revisão.

## Dataset \{#dataset\}

O dataset fornecido contém 10.000 registros de unidades de saúde da Índia e 51 colunas.

Todos os registros incluem nome da unidade de saúde, estado, cidade, latitude, longitude, especialidades controladas, uma descrição e URLs de origem; 9.996 registros incluem código postal. Os campos de evidência extraídos são ruidosos, repetitivos e têm sustentação irregular:

| Campo           | Cobertura |
| --------------- | --------- |
| description     | 100%      |
| capability      | 99,7%     |
| procedure       | 92,5%     |
| equipment       | 77,0%     |
| numberDoctors   | 36,4%     |
| capacity        | 25,2%     |
| yearEstablished | 47,8%     |

Evidências úteis aparecem em description, capability, procedure, equipment, specialties e source&#95;urls. As equipes devem tratar esses campos como alegações a verificar, e não como verdade absoluta.

## Escolha uma trilha \{#pick-one-track\}

### Trilha 1: Central de Confiança de Unidades de Saúde \{#track-1-facility-trust-desk\}

Pergunta: esta unidade de saúde realmente faz o que alega?

Crie um aplicativo que avalie as alegações das unidades de saúde sobre capacidades como UTI, maternidade, emergência, oncologia, trauma ou UTI neonatal. Para cada unidade e capacidade, gere um sinal de confiança: evidência forte, evidência parcial, evidência fraca ou suspeita, ou nenhuma alegação.

Fluxo de trabalho mínimo: um planejador seleciona uma capacidade e uma região, vê as unidades classificadas por ranking, expande uma unidade para inspecionar as citações e pode sobrescrever a avaliação com uma anotação.

### Trilha 2: Planejador de Desertos Médicos \{#track-2-medical-desert-planner\}

Pergunta: onde estão as lacunas de atendimento de maior risco e qual é a nossa confiança de que essas lacunas são reais?

Crie um app que agregue evidências sobre unidades de saúde ponderadas por confiabilidade em diferentes recortes geográficos, como estado, cidade, distrito ou código postal. Ajude os planejadores a distinguir lacunas reais de atendimento de regiões com poucos dados.

Fluxo de trabalho mínimo: o planejador seleciona uma capacidade e uma região geográfica, visualiza a cobertura regional, detalha os registros das unidades por trás de um agregado e salva um cenário de planejamento.

### Trilha 3: Referral Copilot \{#track-3-referral-copilot\}

Pergunta: para onde um paciente ou coordenador deve realmente ir?

Crie um app em que o usuário informa uma localização e uma necessidade de atendimento, como &quot;diálise perto de Jaipur&quot; ou &quot;cirurgia de emergência perto de Patna&quot;, e recebe uma lista de selecionados de unidades de saúde candidatas, com as evidências anexadas.

Fluxo mínimo: entram localização e necessidade; saem candidatos ranqueados; cada candidato exibe distância, evidências correspondentes, evidências ausentes ou suspeitas, e pode ser salvo em uma lista de selecionados.

### Track 4: Data Readiness Desk \{#track-4-data-readiness-desk\}

Pergunta: o que precisa ser corrigido antes que este dataset possa ser considerado confiável para planejamento?

Construa um app para criar perfis, revisar e aprimorar o dataset de unidades de saúde. Destaque contradições, alegações suspeitas, campos com poucos dados e registros de alto impacto para revisão humana.

Fluxo mínimo: exibir problemas de completude e qualidade, oferecer uma fila de revisão de registros sinalizados e persistir as decisões dos revisores para uso posterior.