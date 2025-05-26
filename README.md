# Moderator

**Moderator** es una aplicación diseñada para la moderación automática de texto, desarrollada como parte de la materia Electiva III (Arquitectura Web) en la FP-UNA. Su objetivo principal es analizar textos proporcionados y determinar si contienen palabras que deberían generar un rechazo, utilizando coincidencias exactas y el algoritmo de Levenshtein para detectar palabras con hasta un nivel de diferencia.

## Especificaciones Técnicas

- **Servidor**: Linux (Ubuntu 24.04)
- **Lenguaje y Entorno**: JavaScript / Node.js
- **Framework**: Fastify
- **Base de Datos**: PostgreSQL
- **Arquitectura**: API REST

## Funcionalidades Actuales

- **Endpoint `/verify`**: Permite a otras aplicaciones enviar un texto para su verificación. El sistema analiza el texto y determina si contiene palabras que deberían ser rechazadas.
  - **Coincidencias Exactas**: Detecta palabras que coinciden exactamente con las palabras prohibidas.
  - **Algoritmo de Levenshtein**: Identifica palabras con hasta un nivel de diferencia en comparación con las palabras prohibidas. Por ejemplo, "terible" se considerará una variante de "terrible".

## Requisitos Previos

- **Node.js**: Asegúrate de tener instalado Node.js en tu sistema. Puedes descargarlo desde [https://nodejs.org/](https://nodejs.org/).
- **PostgreSQL**: Es necesario tener PostgreSQL instalado y en funcionamiento. Puedes obtenerlo en [https://www.postgresql.org/download/](https://www.postgresql.org/download/).


## Iniciar el proyecto

node index.js

