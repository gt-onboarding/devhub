Una aplicación de chat de IA con streaming en Databricks: el usuario envía un mensaje, el servidor se autentica con el perfil de la CLI de Databricks (o con un token de service principal en producción), llama a un endpoint de serving de un modelo fundacional mediante el proveedor compatible con OpenAI y devuelve la respuesta en streaming, token a token. Las sesiones de chat y los mensajes se persisten en Lakebase Postgres, de modo que las conversaciones se mantienen tras recargar la página o volver a desplegar.

### Cómo encajan los pasos entre sí \{#how-the-steps-fit-together\}

Sigue los pasos en el orden indicado. Cada uno aporta una pieza concreta; al final tendrás una aplicación lista para desplegar. Los Databricks agent skills que tienes instalados aportan los patrones de implementación de cada paso.

1. **Poner en marcha una Databricks App** — genera el scaffold de una Databricks App con AppKit desde cero mediante `databricks apps init` (el meta-prompt anterior ya verifica el perfil de la CLI mediante [Configura tu entorno de desarrollo local](/templates/set-up-your-local-dev-environment)).
2. **Consultar endpoints de modelos fundacionales** — elige un modelo de chat (por ejemplo, `databricks-gpt-5-4-mini`) y configura `createOpenAI()` con la URL base `/serving-endpoints` de tu workspace.
3. **Chat de IA en streaming con Model Serving** — añade la ruta `/api/chat` con `streamText()` y una UI con `useChat` respaldada por `TextStreamChatTransport`.
4. **Crear un proyecto de Lakebase** — aprovisiona un proyecto, una branch y un endpoint de managed Postgres; anota los valores de conexión.
5. **Persistencia de datos en Lakebase** — añade el plugin `lakebase()`, la configuración del schema y la lógica CRUD sobre tu nuevo proyecto.
6. **Memoria del agente en Lakebase** — crea las tablas `chat.chats` y `chat.messages` y persiste cada turno de cada conversación.

### Antes de empezar \{#before-you-start\}

Cada paso indica sus propias comprobaciones de funcionalidades del workspace. En conjunto, la aplicación necesita un perfil del CLI de Databricks con acceso a Model Serving (endpoints de modelos fundacionales alojados en Databricks), Lakebase Postgres y Databricks Apps. Ejecuta las comprobaciones de requisitos previos de cada paso desde el principio para no toparte con funcionalidades restringidas a mitad del desarrollo.