# MVP PQRSF Inteligente IKUSI - Sprint 1

Plataforma basada en microservicios para la gestión inteligente de Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones (PQRSF) para IKUSI Colombia.

## Arquitectura

La solución se compone de 5 microservicios orquestados mediante Docker Compose:

1. **api-pqrsf**: API REST principal (FastAPI) para gestión de casos, SLAs, histórico y Dashboard. Documentación Swagger en `/docs`.
2. **ia-classifier**: Servicio independiente (FastAPI) que implementa un patrón Adapter (Mock o Google Gemini) para la clasificación de texto (identificación de tipo, área responsable, arquitectura, prioridad, sentimiento).
3. **email-listener**: Tarea en segundo plano (Python) que monitorea un buzón IMAP, descarga adjuntos, invoca a la IA y al API principal, y responde al cliente (SMTP) de forma automatizada cada 60 segundos.
4. **frontend**: Dashboard interactivo (Next.js, React) con diseño Premium Glassmorphism.
5. **postgres**: Base de datos relacional persistente.

## Despliegue Local

### Requisitos
- Docker y Docker Compose
- Node.js (opcional para desarrollo local del frontend sin Docker)

### Pasos

1. Copiar `.env.example` a `.env` y configurar las credenciales:
   ```bash
   cp .env.example .env
   ```
   **Importante:** Añadir tu `GEMINI_API_KEY` válida y poner `USE_MOCK=False` si deseas probar el motor de IA real, configurar credenciales IMAP/SMTP (Gmail App Passwords, por ejemplo).

2. Levantar toda la infraestructura:
   ```bash
   docker compose up --build -d
   ```

3. Verificar estado de los contenedores:
   ```bash
   docker compose ps
   ```

### Accesos

- **Dashboard Web:** [http://localhost:3000](http://localhost:3000)
  - Usuario: `admin`
  - Contraseña: `admin123` (o la configurada en tu `.env`)
- **API Swagger Documentación:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **IA Classifier Health:** [http://localhost:8001/health](http://localhost:8001/health)

## Características del Sprint 1

- Clasificación automática con Google Gemini (1.5 Flash).
- Generación de consecutivos `PQRSF-YYYY-XXXX`.
- Reglas de SLA dinámicas y seguimiento en Dashboard.
- Recepción de correo 100% automatizada.
- Interfaz Premium, moderna, con KPIs Ejecutivos.
- Trazabilidad y almacenamiento persistente de adjuntos.
