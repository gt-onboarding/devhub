---
title: Genie Agents
sidebar_label: Genie
description: Integra una interfaz de chat sobre tablas de Unity Catalog con el plugin Genie de AppKit y el componente GenieChat. Sin código text-to-SQL, sin prompts, sin LLM personalizado.
sourceOfTruth:
  skills:
    - databricks-genie-agents
  docs:
    - /docs/appkit/v0/plugins/genie
    - https://docs.databricks.com/aws/en/genie-agents/
---

# Genie Agents \{#genie-agents\}

Ofrece a tus usuarios un cuadro de chat que consulta tus datos. Sin text-to-SQL, sin mapeo de esquemas, sin LLM personalizado. Un **Genie Agent** (antes Genie space) es una interfaz de lenguaje natural de Databricks sobre tablas de Unity Catalog: conjuntos de datos curados, más un almacén de conocimiento (sinónimos, SQL de ejemplo, descripciones de columnas), más un sistema de IA compuesto que convierte las preguntas en SQL. Tu aplicación de AppKit lo integra con un plugin en el servidor y un componente en la página.

Para probar un Genie Agent en el workspace antes de integrarlo, consulta [Usar un Genie Agent](https://docs.databricks.com/aws/en/genie-agents/talk-to-genie). Para crear o gestionar uno desde tu agente de programación, usa la agent skill [`databricks-genie-agents`](/es/docs/tools/ai-tools/agent-skills).

:::note[Genie Agents dentro de la familia Genie]

Genie es una familia de productos de Databricks: Genie One, Genie Agents y Genie Code. Esta página trata sobre Genie Agents, la interfaz de lenguaje natural sobre tus tablas de Unity Catalog, y cómo integrar uno en una aplicación de AppKit. Para los demás productos, consulta la [descripción general de Genie](https://docs.databricks.com/aws/en/genie/).

:::

## Requisitos previos \{#prerequisites\}

* Databricks CLI `v1.0.0+` con un [perfil autenticado](/es/docs/tools/databricks-cli#authenticate).
* Una app de AppKit en ejecución. Consulta el [Inicio rápido de Apps](/es/docs/apps/quickstart).
* Un Genie Agent configurado sobre tablas de Unity Catalog. Consulta [Create and manage a Genie Agent](https://docs.databricks.com/aws/en/genie-agents/set-up) para configurarlo.

  Adjunta el agente como recurso en la configuración de la app (interfaz o CLI) con **Can run** seleccionado, y Databricks otorgará ese permiso al service principal de tu app. Después, `app.yaml` vincula el recurso a una variable de entorno. Los permisos del usuario final se explican [más adelante](#permissions-and-data-access).

## Por qué Genie \{#why-genie\}

De la pregunta al resultado, Genie:

* **Entiende tu esquema** a partir de tablas de Unity Catalog, sinónimos, ejemplos de SQL y descripciones de columnas.
* **Genera SQL** a partir de preguntas en lenguaje natural, y pide aclaraciones cuando el prompt es ambiguo.
* **Ejecuta la consulta** en tu warehouse y devuelve resultados tabulares listos para renderizar.

El [plugin `genie`](/es/docs/appkit/v0/plugins/genie) conecta todo eso con tu interfaz de chat y se encarga del streaming por SSE, la autenticación y la reproducción de conversaciones.

## Conectar el plugin \{#wire-the-plugin\}

Registra el plugin con uno o más alias de space. Las claves de alias se convierten en la prop `alias` del componente de frontend.

```typescript title="server/server.ts"
import { createApp, genie, server } from "@databricks/appkit";

await createApp({
  plugins: [
    server(),
    genie({
      spaces: {
        sales: process.env.SALES_GENIE_SPACE_ID!,
      },
    }),
  ],
});
```

Vincula cada alias a un recurso de Genie Agent en `app.yaml`:

```yaml title="app.yaml"
env:
  - name: SALES_GENIE_SPACE_ID
    valueFrom: genie-space
```

El runtime de Databricks Apps inyecta el ID del space del recurso en la variable de entorno. Puedes encontrar el ID de tu space en la pestaña **Settings** de la página del Genie Agent en tu workspace.

Para una aplicación de un solo agente, omite por completo la configuración de `spaces` y vincula la variable de entorno predeterminada del plugin:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_GENIE_SPACE_ID
    valueFrom: genie-space
```

Si no se pasa `spaces`, el plugin lee `DATABRICKS_GENIE_SPACE_ID` y lo registra con el alias `default`.

## Renderizar el componente de chat \{#render-the-chat-component\}

```tsx title="client/src/pages/ChatPage.tsx"
import { GenieChat } from "@databricks/appkit-ui/react";

export function ChatPage() {
  return (
    <div style={{ height: 600 }}>
      <GenieChat alias="sales" />
    </div>
  );
}
```

La prop `alias` debe coincidir con una clave de la configuración `spaces` del servidor. `<GenieChat>` ocupa todo el espacio de su contenedor padre, así que colócalo en un contenedor de altura fija o su altura se reducirá a cero. El componente renderiza los mensajes, gestiona el streaming, conserva el ID de la conversación en la URL y restaura el historial al recargar. Consulta la [referencia de GenieChat](/es/docs/appkit/v0/api/appkit-ui/genie/GenieChat) para ver la lista completa de props.

## Interfaz personalizada con `useGenieChat` \{#custom-ui-with-usegeniechat\}

Para crear una interfaz de chat personalizada, usa el hook directamente. Devuelve el mismo flujo de mensajes junto con el estado del ciclo de vida de la solicitud.

```tsx title="client/src/pages/CustomChat.tsx"
import { useGenieChat } from "@databricks/appkit-ui/react";

export function CustomChat() {
  const { messages, status, sendMessage, reset } = useGenieChat({
    alias: "sales",
  });

  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} data-role={msg.role}>
          {msg.content}
        </div>
      ))}
      <button
        onClick={() => sendMessage("What were total sales last quarter?")}
        disabled={status === "streaming"}
      >
        Ask
      </button>
      <button onClick={reset}>New conversation</button>
    </>
  );
}
```

`status` alterna entre `idle`, `streaming`, `loading-history`, `loading-older` y `error`. Úsalo para gestionar los estados de carga en tu interfaz. El hook también devuelve `error`, `conversationId` y utilidades de paginación (`hasPreviousPage`, `isFetchingPreviousPage`, `fetchPreviousPage`). Consulta la [referencia del plugin Genie de AppKit](/es/docs/appkit/v0/plugins/genie) para ver el tipo de retorno completo y la [API de conversación de Genie](https://docs.databricks.com/aws/en/genie-agents/conversation-api) para la API REST subyacente.

## Múltiples spaces \{#multiple-spaces\}

Registra más de un space para que tus usuarios puedan alternar entre dominios; por ejemplo, un space de ventas y otro de soporte en la misma aplicación.

```typescript title="server/server.ts"
genie({
  spaces: {
    sales: process.env.SALES_GENIE_SPACE_ID!,
    support: process.env.SUPPORT_GENIE_SPACE_ID!,
  },
}),
```

Vincula cada ID a un recurso independiente en `app.yaml`. Consulta el template [Genie Multi-Agent Selector](/es/templates/genie-multi-space) para ver una interfaz funcional con cambio de agente, limpieza de conversaciones y sincronización de la URL.

## Permisos y acceso a datos \{#permissions-and-data-access\}

El plugin `genie` llama a la API de Genie en nombre del usuario que ha iniciado sesión. Para que una solicitud se complete correctamente, tanto el service principal de la aplicación como cada usuario final necesitan acceso:

* **Service principal de la aplicación**: `CAN RUN` sobre el Genie Agent, que se concede al adjuntar el agente como recurso de la aplicación (desde la interfaz o la CLI) con **Can run** seleccionado. Los permisos sobre los datos subyacentes no se aprovisionan automáticamente: concede al service principal `USE CATALOG`, `USE SCHEMA` y `SELECT` sobre las tablas de Unity Catalog por separado. Consulta [Add a Genie Agent resource to an app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/genie).
* **Usuarios finales**: acceso al Genie Agent (compartido con ellos o a través de un grupo) y `SELECT` sobre esas mismas tablas. Si el usuario no tiene acceso, la llamada devuelve un 403. No tienes que escribir la comprobación de permisos.

## Qué sigue \{#where-to-next\}

Prueba la [Genie Analytics App](/es/templates/genie-analytics-app) para ver una configuración completa ya integrada, o explora los [endpoints de agentes personalizados](/es/docs/agents/custom-agents) para Knowledge Assistants y Supervisor Agents.