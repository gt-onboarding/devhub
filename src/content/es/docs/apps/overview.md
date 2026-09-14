---
title: ¿Qué es Databricks Apps?
sidebar_label: Descripción general
description: Databricks Apps aloja aplicaciones web dentro de tu workspace con autenticación integrada, compute gestionado y acceso directo a tus datos.
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
  note: "AppKit (el SDK de TypeScript) está documentado en DevHub y en la skill databricks-apps. docs.databricks.com cubre la plataforma Apps (despliegue, autenticación, runtime), no AppKit."
---

# ¿Qué es Databricks Apps? \{#what-is-databricks-apps\}

Databricks Apps aloja tu aplicación web dentro de tu workspace. La app obtiene una URL fija, OAuth integrado y acceso directo a los datos y servicios de tu workspace. Sin servicios de alojamiento aparte, sin capa de autenticación que desarrollar y sin rotación de credenciales que gestionar.

**[AppKit](/es/docs/appkit/v0)** es el SDK de TypeScript para crear esas aplicaciones. Incluye componentes de interfaz React listos para usar, acceso a datos con tipado seguro y un sistema de plugins para conectarse a los servicios de Databricks.

## Cómo funciona \{#how-it-works\}

AppKit utiliza una arquitectura de tres capas con plugins que registran capacidades en cada capa:

* **Cliente**: frontend de React servido por Vite. El paquete `@databricks/appkit-ui` proporciona tablas de datos, gráficos, diálogos y componentes de maquetación.
* **Servidor**: servidor HTTP Express con OAuth de Databricks integrado. Los plugins añaden rutas y middleware en esta capa.
* **Datos**: acceso basado en plugins a los recursos de Databricks. Cada plugin encapsula un tipo de recurso y expone una API tipada en el objeto `AppKit`.

| Plugin                                               | Qué aporta                                                                                                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**server**](/es/docs/appkit/v0/plugins/server)         | Servidor HTTP Express, servicio de archivos estáticos, modo de desarrollo de Vite (siempre incluido)                                                                                                     |
| [**lakebase**](/es/docs/appkit/v0/plugins/lakebase)     | Pool de conexiones Postgres para [Lakebase Postgres](/es/docs/lakebase/quickstart) con refresh automático del token de OAuth                                                                |
| [**analytics**](/es/docs/appkit/v0/plugins/analytics)   | Ejecución de consultas SQL sobre [SQL warehouses de Databricks](https://docs.databricks.com/aws/en/compute/sql-warehouse/). Consulta [Analytical reads](/es/docs/lakehouse/analytical-reads). |
| [**genie**](/es/docs/appkit/v0/plugins/genie)           | Integración con [Genie Agent](/es/docs/agents/genie) para consultas de datos en lenguaje natural                                                                                               |
| [**serving**](/es/docs/appkit/v0/plugins/model-serving) | Proxy autenticado a endpoints de [Model Serving](/es/docs/agents/ai-gateway) con soporte de streaming                                                                              |
| [**files**](/es/docs/appkit/v0/plugins/files)           | Operaciones con archivos sobre [volúmenes de Unity Catalog](https://docs.databricks.com/aws/en/files/)                                                                                    |
| [**agents**](/es/docs/appkit/v0/plugins/agents)         | Agentes de IA definidos en markdown o en código, con descubrimiento automático de herramientas                                                                                               |
| [**ai-search**](/es/docs/appkit/v0/plugins/ai-search)   | Búsqueda semántica y vectorial sobre tus índices de AI Search                                                                                                                        |
| [**jobs**](/es/docs/appkit/v0/plugins/jobs)             | Activa y supervisa [Lakeflow Jobs de Databricks](/es/docs/lakehouse/jobs)                                                                                                          |
| [**caching**](/es/docs/appkit/v0/plugins/caching)       | Caché de respuestas a nivel global y de plugin, respaldada por [Lakebase Postgres](/es/docs/lakebase/quickstart) cuando está disponible                                                             |

Para ver el conjunto completo y actualizado de plugins, consulta la [referencia de plugins](/es/docs/appkit/v0/plugins).

## Cómo funciona la autenticación \{#how-auth-works\}

Cada app cuenta con un service principal propio. Databricks inyecta sus credenciales en runtime, de modo que tu app puede llamar a las APIs del workspace sin gestionar tokens.

De forma predeterminada, todas las solicitudes se ejecutan como ese service principal y todos los usuarios comparten sus permisos. Cuando necesites acceso a datos por usuario, Databricks puede reenviar el token del usuario autenticado mediante `x-forwarded-access-token`. Los plugins integrados de AppKit para [Genie](/es/docs/agents/genie) y [Model Serving](/es/docs/agents/ai-gateway) lo hacen automáticamente.

## Cuándo usarlo \{#when-to-use-it\}

Las apps tratan de la **interactividad**, no solo de la analítica. Un panel es ideal para vistas de solo lectura con filtros predefinidos. Una app hace eso y, además, acepta datos de entrada, ejecuta lógica y guarda los resultados de forma persistente. Crea una app cuando tu flujo de trabajo necesite alguna de esas capacidades; por ejemplo, un generador de escenarios que guarde los casos creados por los usuarios o una herramienta interna que sustituya un proceso manual basado en hojas de cálculo.

## Cuándo no usarlo \{#when-not-to-use-it\}

* **Sitios estáticos sin acceso a datos de Databricks.** Puedes alojarlos en cualquier sitio.
* **Aplicaciones públicas o dirigidas a clientes.** De forma predeterminada, los usuarios deben ser identidades autenticadas de tu cuenta de Databricks (no necesitan pertenecer al workspace de la aplicación). Para el acceso externo o de clientes, consulta [App Users](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/key-concepts#app-users).
* **Paneles de solo lectura** que los [Dashboards](https://docs.databricks.com/aws/en/dashboards/) de AI/BI ya cubren. Usa un panel hasta que necesites conservar la entrada del usuario o ejecutar lógica personalizada sobre ella.

## Siguientes pasos \{#where-to-next\}

Las [plantillas](/es/templates) son prompts listos para agentes organizados por caso de uso. Busca la que mejor se adapte a tu caso o consulta la [guía de inicio rápido de Apps](/es/docs/apps/quickstart) para ver un recorrido paso a paso.