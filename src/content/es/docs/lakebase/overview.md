---
title: ¿Qué es Lakebase Postgres?
sidebar_label: Descripción general
description: Lakebase Postgres es Postgres gestionado dentro de Databricks, ubicado junto a tu Lakehouse. Almacenamiento OLTP con branching instantáneo y autoscaling.
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/
---

# ¿Qué es Lakebase Postgres? \{#what-is-lakebase-postgres\}

Lakebase Postgres es un PostgreSQL gestionado que se ejecuta dentro de tu workspace de Databricks, ubicado junto a los datos y servicios de tu workspace.

Úsalo para los datos que tus aplicaciones escriben y leen de forma activa con baja latencia: estado de usuario, sesiones, historial de conversaciones y registros almacenados junto a tus datos analíticos en el Lakehouse.

Esta página ofrece la perspectiva de AppKit sobre Lakebase. Para conocer Lakebase Postgres en sí (proyectos, branching, autoscaling, conectividad), consulta la [documentación de Lakebase](https://docs.databricks.com/aws/en/oltp/) o la habilidad de agente [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills).

## Qué lo diferencia de ejecutar tu propio Postgres \{#what-makes-it-different-from-running-your-own-postgres\}

- **Se ejecuta dentro de tu workspace**, lo que elimina el emparejamiento de VPC, la gestión de credenciales entre nubes y la latencia de red.
- El **branching instantáneo** mediante almacenamiento copy-on-write crea copias aisladas de la base de datos en segundos, de forma similar a las ramas de git. Las branches comparten los datos sin modificar, por lo que crearlas y mantenerlas resulta económico.
- **Autoescala** según tu carga de trabajo: aumenta la capacidad cuando hay carga y la reduce cuando baja la demanda, dentro de un rango mínimo/máximo configurado. Sin planificación de capacidad ni redimensionamiento manual.
- **Escala a cero** cuando está inactivo y se reanuda con la siguiente consulta. Sin coste por compute inactivo. El tiempo de espera por inactividad es de 24 horas de forma predeterminada y puede establecerse entre 60 segundos y 7 días.

## Cómo lo conecta AppKit \{#how-appkit-wires-it-up\}

Agrega el plugin `lakebase()` a `createApp` y el plugin configurará un `pg.Pool` con refresh automático del token de OAuth:

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// Consulta estándar de pg.Pool
const { rows } = await AppKit.lakebase.query("SELECT * FROM app.items");

// Configuración lista para ORM (Drizzle, Prisma, etc.)
const ormConfig = AppKit.lakebase.getOrmConfig();
```

El plugin gestiona automáticamente el refresh de los tokens OAuth y el pooling de conexiones. Al desplegar la aplicación, la plataforma inyecta los valores de conexión como variables de entorno y el plugin los lee. No hace falta ninguna configuración manual. La [referencia del plugin `lakebase` de AppKit](/docs/appkit/v0/plugins/lakebase) detalla las opciones de configuración del pool y la API completa.


## Cuándo utilizarlo \{#when-to-use-it\}

- Tu aplicación necesita lecturas y escrituras de baja latencia: estado del usuario, sesiones, historial de conversaciones o registros transaccionales.
- Estás creando agentes de IA que necesitan memoria persistente: historial de conversaciones, estado del flujo de trabajo o resultados de herramientas a lo largo de varias solicitudes.
- Quieres branches de base de datos aislados para el desarrollo de funcionalidades o para pruebas de CI.
- Estás sincronizando datos entre tu carga de trabajo OLTP y el [Data Lakehouse](/docs/lakehouse/overview) mediante captura de datos de cambios (CDC).

## Cuándo no usarlo \{#when-not-to-use-it\}

- Analítica pura: las consultas de solo lectura sobre grandes conjuntos de datos corresponden a Unity Catalog, no a Lakebase Postgres.
- Aplicaciones sin otras dependencias del workspace de Databricks. La ventaja de la colocación no aplica y la autenticación pasa a ser responsabilidad tuya (Databricks no inyecta credenciales ni renueva tokens en las aplicaciones que se ejecutan fuera del workspace).

## Qué sigue \{#where-to-next\}

Las [plantillas](/templates) son prompts listos para agentes y organizados por caso de uso. Busca la que mejor se adapte a tu caso o consulta la [guía de inicio rápido de Lakebase Postgres](/docs/lakebase/quickstart) para ver instrucciones paso a paso.