---
title: Inicio rápido
sourceOfTruth:
  skills:
    - databricks-apps
    - databricks-lakebase
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/oltp/
---

# Inicio rápido \{#quickstart\}

## Requisitos previos \{#prerequisites\}

* Databricks CLI `v1.0.0+` con un [perfil autenticado](/es/docs/tools/databricks-cli#authenticate)
* `psql` (cliente de PostgreSQL) si usas `databricks psql`. Como alternativa, usa [`generate-database-credential`](/es/docs/lakebase/development#local-database-access) con cualquier cliente de PostgreSQL.
* Un workspace con el acceso a Lakebase Postgres habilitado

## Ruta de templates \{#template-path\}

Explora los templates que se muestran a continuación, elige el que mejor se ajuste a tu caso de uso y cópialo en tu asistente de programación con IA. Todos incluyen el recurso [Create a Lakebase Project](/es/templates/lakebase-create-instance), que te guía por la creación del proyecto y la recopilación de los valores de conexión.

| Template                                                            | Ideal para                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| [App with Lakebase](/es/templates/app-with-lakebase)                   | Aplicaciones CRUD con almacenamiento persistente               |
| [AI Chat App](/es/templates/ai-chat-app)                               | IA conversacional con historial de chat                        |
| [Operational Data Analytics](/es/templates/operational-data-analytics) | Sincronización bidireccional entre Lakebase Postgres y Unity Catalog |

## Personaliza tu app \{#customize-your-app\}

Después de desplegar una app respaldada por Lakebase Postgres, considera las siguientes personalizaciones:

* **Añadir tablas**: sigue el template [Lakebase Data Persistence](/es/templates/lakebase-data-persistence) para definir esquemas, generar tipos y crear rutas CRUD.
* **Añadir memoria al agente**: usa el template [Lakebase Agent Memory](/es/templates/lakebase-agent-memory) para conservar las conversaciones de chat de tu agente.
* **Usar feature branches**: crea branches aisladas para desarrollo y pruebas. La sección [Desarrollo: Feature branches](/es/docs/lakebase/development#feature-branches) incluye los comandos de la CLI.
* **Sincronizar datos con Unity Catalog**: usa [Lakebase Change Data Feed (CDF)](/es/templates/lakebase-change-data-feed-autoscaling) para replicar tablas de Lakebase Postgres en Delta, o [Sync Tables](/es/templates/sync-tables-autoscaling) para servir datos de Unity Catalog a través de él.
* **Desplegar fuera de Databricks**: usa el template [Lakebase Off-Platform](/es/templates/lakebase-off-platform) para apps alojadas en AWS, Vercel, Netlify y otras plataformas.

## Ruta manual \{#manual-path\}

Cuando haces scaffold sin un template, `databricks apps init` genera un proyecto de AppKit funcional. Antes necesitas un proyecto de Lakebase. Crea uno:

```bash
databricks postgres create-project <project-id>
```

El ID se convierte en el nombre de recurso del proyecto (`projects/<project-id>`). Para una configuración guiada que incluya branches y valores de conexión, consulta el template [Create a Lakebase Project](/es/templates/lakebase-create-instance) o la agent skill [`databricks-lakebase`](/es/docs/tools/ai-tools/agent-skills).

**Interactivo** (recomendado para desarrollo local): ejecútalo sin flags.

```bash
databricks apps init
```

La CLI solicita el nombre de tu aplicación y, a continuación, muestra los plugins (funcionalidades) disponibles. Selecciona **Lakebase** y te guiará para elegir un proyecto de Lakebase, una branch y una base de datos ya existentes.

**Modo no interactivo** (para scripts y CI): pasa `--name` y los campos `--set` requeridos por cada funcionalidad de plugin seleccionada. El valor de `database` debe ser la ruta completa del recurso, que se obtiene con `databricks postgres list-databases projects/<project-id>/branches/<branch-id> -o json` (usa el campo `name`):

```bash
databricks apps init --name my-app --features lakebase \
  --set lakebase.postgres.project=projects/<project-id> \
  --set lakebase.postgres.branch=projects/<project-id>/branches/<branch-id> \
  --set lakebase.postgres.database=projects/<project-id>/branches/<branch-id>/databases/<database-id>
```

Después, despliega primero para crear los esquemas y luego ejecuta la app localmente:

```bash
cd my-app
databricks apps deploy
```

:::tip
Ejecuta `databricks apps deploy` antes que `npm run dev`. El despliegue configura una identidad gestionada (el service principal de la app) que crea el esquema de la base de datos en el primer arranque. Si, en cambio, ejecutas primero `npm run dev`, el esquema se creará con tus credenciales personales y, al desplegar más adelante, la identidad gestionada de la app no podrá acceder a él. En [Configuración local](/es/docs/lakebase/development#local-setup) se explica con más detalle.
:::

```bash
npm install && npm run dev
```

## Qué sigue \{#where-to-next\}

Para conocer el flujo de desarrollo local, las feature branches y la API completa del plugin, consulta [Desarrollo con Lakebase Postgres](/es/docs/lakebase/development).