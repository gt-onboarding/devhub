---
title: ¿Qué son los templates?
sidebar_label: ¿Qué son los templates?
description: Los templates son prompts de agente listos para copiar y pegar que guían a tu asistente de código a lo largo de una tarea de desarrollo en Databricks, desde generar el scaffold de una app completa hasta añadir una funcionalidad a una app ya existente.
---

# ¿Qué son los templates? \{#what-are-templates\}

DevHub incluye una colección de [templates](/templates) que te ayudan a generar rápidamente la estructura de una app de Databricks.

Un **template** es simplemente un prompt para el agente: un bloque de texto que pegas en tu asistente de programación (Cursor, Claude Code, Codex o cualquier agente que se ejecute en tu editor) y que le indica exactamente cómo construir algo en Databricks.

El asistente se encarga del trabajo: hará preguntas para aclarar dudas, ejecutará la Databricks CLI, escribirá código y desplegará. Tú sigues participando para tomar las decisiones de alto nivel, pero no necesitas conocer ni recordar ningún comando específico.

## Cómo usar un template \{#how-to-use-a-template\}

Todos los templates de este sitio tienen un botón **Copy prompt** en la parte superior.

1. Abre un template en [/templates](/templates) y elige el que mejor se ajuste a lo que quieres crear.
2. Haz clic en **Copy prompt** y pega el resultado en tu agente de programación.
3. El agente lee el prompt, hace las preguntas necesarias (qué workspace, qué catálogo, datos reales o datos de ejemplo, etc.) y luego construye la aplicación.

## Las variantes \{#the-flavors\}

Los templates se presentan en dos variantes: templates de aplicaciones completas (de extremo a extremo) y templates de tareas.

### Templates de aplicaciones completas \{#end-to-end-app-templates\}

El agente crea una aplicación de Databricks completa desde cero: interfaz, servidor, recursos de Databricks y pasos de despliegue incluidos. Úsalos cuando empieces un proyecto nuevo y quieras una aplicación funcional que puedas adaptar a tu caso de uso.

Ejemplos:

- [App with Lakebase](/templates/app-with-lakebase): una aplicación CRUD respaldada por Postgres gestionado.
- [AI Chat App](/templates/ai-chat-app): una aplicación de chat con respuestas en streaming e historial de conversación persistente.
- [Vacation Rentals Operations Console](/templates/vacation-rentals): una cola de reservas con marcas y notas de agente respaldadas por Lakebase, analítica de ingresos con SQL Warehouse y un panel de chat de Genie integrado.

Algunos templates completos también incluyen una base de código inicial desplegable del repositorio [app-templates](https://github.com/databricks/app-templates) de Databricks. En ese caso, el agente lo clona como punto de partida y lo adapta a tus datos, tu workspace y tu caso de uso.

### Templates de tareas \{#task-templates\}

El agente realiza una única tarea concreta sobre un proyecto existente. Úsalos cuando ya tengas una app de Databricks y quieras añadirle algo.

Ejemplos:

- [Onboard Your Coding Agent](/templates/onboard-your-coding-agent): instala las skills de la plataforma Databricks y el Docs MCP Server en tu repositorio.
- [Lakebase Data Persistence](/templates/lakebase-data-persistence): añade almacenamiento gestionado de Postgres a una app que ya tengas.
- [Create a Lakebase Project](/templates/lakebase-create-instance): aprovisiona un proyecto de Lakebase y recopila los valores de conexión.

Los templates de tareas están diseñados para combinarse. Encadenando varios puedes pasar de un repositorio vacío a una app desplegada, que es justamente lo que hacen internamente los templates de extremo a extremo.

## Siguientes pasos \{#where-to-go-next\}

- Explora el [catálogo completo de templates](/templates).
- Profundiza en los servicios de la plataforma Databricks que puedes usar para crear tu app: [Databricks Apps](/docs/apps/overview), [Lakebase Postgres](/docs/lakebase/overview), [Agent Bricks](/docs/agents/overview) y el [Data Lakehouse](/docs/lakehouse/overview).