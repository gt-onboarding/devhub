---
title: Docs MCP Server
---

# Docs MCP Server \{#docs-mcp-server\}

El Docs MCP Server de DevHub otorga a los agentes de programación y a los asistentes de IDE acceso de lectura a todas las páginas de documentación de DevHub. Los agentes pueden explorar las páginas disponibles y obtener documentos individuales en markdown sin salir del editor.

## Instalación \{#install\}

Agrega el servidor a cualquier agente de programación compatible (Cursor, Claude Code, VS Code, Codex y otros) con un solo comando.

Instalación global (a nivel de usuario, disponible en todos los proyectos):

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g
```

Instalación a nivel de proyecto (solo en el directorio actual):

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs
```

Para especificar un agente concreto, añade `-a`:

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g -a cursor
```

Reinicia tu editor después de agregar el servidor. Algunos editores, como Cursor, requieren que vayas a la página de configuración de MCP y habilites el nuevo servidor.


## Verificar la conexión \{#verify-the-connection\}

Tras la instalación, confirma que el servidor funciona:

1. Comprueba que `devhub-docs` aparece en tus listados de herramientas.
   - Ejemplo: «¿Tienes instalado el MCP devhub-docs?»
2. Pide a tu agente que llame a `list_docs_resources` y verifica que devuelva un índice de la documentación.
   - Ejemplo: «¿Qué documentación hay disponible en devhub?»
3. Pide a tu agente que obtenga una página concreta con `get_doc_resource`.
   - Ejemplo: «¿Cuál es el contenido de la página start-here?»

En la práctica, no tienes que preocuparte por llamar directamente a las herramientas: basta con pedirle a tu agente que haga el trabajo y él las invocará internamente.

## Referencia de herramientas \{#tools-reference\}

El servidor expone dos herramientas de solo lectura.

### `list_docs_resources` \{#list_docs_resources\}

Enumera todas las páginas disponibles de la documentación para desarrolladores de Databricks. Devuelve el índice de la documentación en markdown con las URL y los títulos de las páginas.

Sin parámetros.

```
list_docs_resources()
→ markdown index of all doc pages with slugs and titles
```


### `get_doc_resource` \{#get_doc_resource\}

Obtiene una única página de la documentación para desarrolladores de Databricks en formato markdown. Usa primero `list_docs_resources` para descubrir los slugs disponibles.

| Parámetro | Tipo   | Obligatorio | Descripción                                                                                                                  |
| --------- | ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `slug`    | string | sí          | El slug (ruta) de la página de documentación, por ejemplo, `start-here`. Usa `list_docs_resources` para encontrar los slugs. |

```
get_doc_resource(slug: "start-here")
→ full markdown content of the requested page
```

Las páginas que declaran una fuente de verdad comienzan con una breve línea **Source of truth** que indica las agent skills y los documentos canónicos que deben cargarse para conocer el comportamiento actual del producto.


## Próximos pasos \{#where-to-next\}

Con la [Databricks CLI](/docs/tools/databricks-cli), las [agent skills](/docs/tools/ai-tools/agent-skills) y el Docs MCP Server ya instalados, tu agente de programación cuenta con todo lo necesario para desarrollar y desplegar.

¿Todo listo para empezar? Descubre cómo los [templates](/docs/templates) te permiten crear la estructura de tu proyecto en cuestión de minutos, o explora directamente el [catálogo de templates](/templates).