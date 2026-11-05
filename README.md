# API SAN

API SAN (Sistema Academico de Navegacion) es una API REST hecha con NestJS para buscar, consultar y comparar ofertas academicas. Dada una carrera y los parametros del usuario (ciudad, costo maximo, modalidad, jornada y pesos de preferencia), identifica las universidades que la ofrecen y las ordena por afinidad.

Los datos se guardan en PostgreSQL y se acceden con TypeORM.

La referencia de endpoints (metodos, campos, validaciones, respuestas, errores y ejemplos curl) esta en [docs/api.md](docs/api.md).

## Requisitos

- Node.js 24 (la imagen Docker usa `node:24-alpine`).
- npm (viene con Node.js).
- Docker con Docker Compose v2 para levantar PostgreSQL. Tambien sirve para correr la API y pgAdmin en contenedores.

## Instalacion

```bash
npm install
cp .env.example .env
```

El `.env` contiene `PORT`, las variables `POSTGRES_*` y las de pgAdmin (`PGADMIN_EMAIL`, `PGADMIN_PASSWORD`, `PGADMIN_PORT`). La app no arranca si falta alguna variable de PostgreSQL, porque se leen con `getOrThrow`. El `.env` no se commitea.

## Base de datos

1. Levantar PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

   Queda expuesto en `localhost:5432` (o el valor de `POSTGRES_PORT`). Si ese puerto ya lo usa un PostgreSQL local, cambiar `POSTGRES_PORT` en `.env` (por ejemplo a `5433`).

2. Cargar el catalogo inicial:

   ```bash
   npm run seed
   ```

   Carga carreras, universidades, ofertas y un usuario demo (`nicolas@correo.com` / `123456`). Es idempotente: se puede correr varias veces sin duplicar datos. Las tablas se crean solas porque TypeORM usa `synchronize: true`; todavia no hay migraciones.

## Ejecutar la API

### En local (desarrollo)

```bash
npm run start:dev
```

Queda en http://localhost:3000 (o el valor de `PORT`) con recarga automatica. Requiere PostgreSQL arriba.

### Todo en Docker

```bash
docker compose up -d --build
```

Levanta PostgreSQL y la API. La API queda en http://localhost:3000 (o `PORT`). El contenedor de la API no ejecuta el seed: si la base esta vacia, correr `npm run seed` desde el host (con `POSTGRES_HOST=localhost` en `.env`).

Para detener todo: `docker compose down`. Agregar `-v` solo si se quiere borrar el volumen `postgres_data` (se pierden los datos).

### Prueba rapida

```bash
curl http://localhost:3000/carreras
```

## pgAdmin

```bash
docker compose up -d pgadmin
```

Abrir http://localhost:5050 e ingresar con `PGADMIN_EMAIL` y `PGADMIN_PASSWORD` del `.env` (por defecto `admin@apisan.com` / `admin`). El servidor "API SAN" (host `postgres`, puerto 5432, base `api_san`) se precarga desde `docker/pgadmin/servers.json` la primera vez que se crea el volumen `pgadmin_data`. La contrasena de la base se pide al conectar (`POSTGRES_PASSWORD`, por defecto `postgres`).

## Comandos

| Comando | Descripcion |
|---|---|
| `npm run build` | Compila `src/` a `dist/` con Nest CLI |
| `npm run start` | Arranca la app con `nest start` |
| `npm run start:dev` | Arranca en modo desarrollo con watch |
| `npm run start:debug` | Arranca con debugger y watch |
| `npm run start:prod` | Ejecuta `dist/main` (requiere `npm run build` antes) |
| `npm run seed` | Compila y carga el catalogo inicial (`dist/seed`) |
| `npm run lint` | Lint con oxlint sobre `src/` y `test/` |
| `npm run format` | Formatea `src/` y `test/` con Prettier |
| `npm test` | Pruebas unitarias (`src/**/*.spec.ts`). No necesitan PostgreSQL |
| `npm test -- auth` | Corre solo las pruebas que coinciden con `auth` |
| `npm run test:watch` | Pruebas unitarias en modo watch |
| `npm run test:cov` | Pruebas unitarias con cobertura |
| `npm run test:e2e` | Pruebas e2e (`test/`). Requiere PostgreSQL arriba |

Los scripts de prueba ya incluyen `NODE_OPTIONS=--experimental-vm-modules`, porque `@nestjs/common` es ESM puro. No quitarlo ni la configuracion de `jest.config.ts` y `test/jest-e2e.json`.

## Estructura de carpetas

Una carpeta por recurso dentro de `src/`. Cada recurso tiene su controller (solo HTTP), su service (toda la logica), sus DTOs, su modulo y sus entidades.

```
api-san/
├── src/
│   ├── main.ts                 # arranque y ValidationPipe global
│   ├── app.module.ts           # ConfigModule, TypeORM y modulos de recurso
│   ├── env.model.ts            # interfaz Env con las variables de .env
│   ├── seed.ts                 # entrada de npm run seed
│   ├── common/
│   │   └── semilla.ts          # datos iniciales (idempotentes)
│   ├── auth/                   # registro, login y refresh
│   ├── usuarios/               # preferencias y favoritos
│   ├── busquedas/              # busqueda y scoring.service.ts
│   ├── catalogo/               # carreras, universidades y ofertas
│   └── comparacion/            # comparaciones entre ofertas
├── test/                       # e2e (app.e2e-spec.ts, jest-e2e.json)
├── docker/pgadmin/servers.json # servidor precargado en pgAdmin
├── docs/api.md                 # referencia de endpoints
├── docker-compose.yml
├── Dockerfile
└── AGENTS.md                   # reglas del proyecto (arquitectura, git, convenciones)
```

Dentro de cada carpeta de recurso:

- `<recurso>.controller.ts`, `<recurso>.service.ts`, `<singular>.dto.ts`, `<singular>.module.ts`, `<singular>.entity.ts`.
- Los archivos `*.spec.ts` son las pruebas unitarias del recurso.

## Alcance actual

- Los services usan repositorios de TypeORM. No hay JWT ni hash de claves todavia: los tokens son provisionales (`token-<id>` y `refresh-<id>`) y ningun endpoint exige autenticacion.
- No hay Prisma, Redis ni integracion con SNIES. Ver `AGENTS.md`.
