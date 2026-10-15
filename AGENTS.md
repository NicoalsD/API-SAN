# AGENTS.md - API SAN (Sistema Academico de Navegacion)

API REST en NestJS para busqueda, consulta y comparacion de ofertas academicas: dada una carrera y parametros del usuario (ubicacion, costo, modalidad, jornada, etc.) identifica las universidades que la ofrecen y las ordena por afinidad.

## Git (obligatorio)

- ANTES de cualquier cambio: `git pull` sobre `develop` para evitar conflictos. Si hay cambios sin commitear, resolver o preguntar antes de continuar.
- Rama por defecto: `develop`. No trabajar directo sobre ella; crear `feature/<nombre>` desde `develop`.
- Remoto: https://github.com/NicoalsD/API-SAN.git
- Reglas de ramas, commits y plantilla de PR: `.agents/workflow.md`. Todo PR lleva el banner de la cooperativa al inicio del cuerpo y necesita 2 aprobaciones para mergear (ruleset de GitHub).
- PROHIBIDO cualquier atribucion a IA en commits, PR, reviews o archivos: nunca `Co-Authored-By: Claude`, "Generated with Claude Code", "Made with Claude" ni nada parecido. Commits y PR solo con la convencion y la plantilla de `.agents/workflow.md`.

## Alcance actual (respetar)

- Arquitectura por capas: Controller (solo HTTP y mapeo request/response), Service (toda la logica), DTOs.
- Datos en memoria (mock): las ofertas compartidas viven en `src/common/ofertas.mock.ts` (catalogo, busqueda y comparacion las reutilizan); el resto de datos mock, en cada Service. PostgreSQL esta disponible via docker-compose y TypeORM ya esta conectado en `src/app.module.ts`. NO implementar todavia: Prisma, migraciones, Redis, integracion SNIES/MEN, JWT/BCrypt real. Agregarlos solo si se pide.
- Nombres de clases, DTOs y rutas en espanol, iguales al diagrama. No renombrar.
- Simplicidad: seguir el estilo de `IvonneBarco/book-nestjs-5b` (DTOs con class-validator, excepciones de Nest con mensajes en espanol, respuestas `{ message, data }` o `{ msg }`).
- Excepciones: lanzarlas en los Services con las clases de Nest (`NotFoundException`, `ConflictException`, `BadRequestException`, `UnauthorizedException`) y mensajes en espanol. Los controllers no validan a mano: el `ValidationPipe` global responde 400.

## Estructura (capas)

- Una carpeta por recurso en `src/`: `auth/`, `usuarios/`, `busquedas/`, `catalogo/`, `comparacion/`.
- Archivos por recurso: `<recurso>.controller.ts`, `<recurso>.service.ts`, `<singular>.dto.ts`, `<singular>.module.ts` (todas las clases Dto del recurso en ese unico archivo).
- Modulos de Nest: cada recurso migra a su propio `<singular>.module.ts` (clase `<Singular>Module`, en espanol) que registra su controller y service y exporta el service; `src/app.module.ts` solo lo importa. Ya migrado: `usuarios/usuario.module.ts` (`UsuarioModule`). Los recursos aun no migrados se registran directo en `src/app.module.ts`.
- `src/main.ts` usa `ValidationPipe` global y escucha en `process.env.PORT ?? 3000`.

## Configuracion (variables de entorno)

- Igual que `IvonneBarco/book-nestjs-5a`: `ConfigModule.forRoot({ isGlobal: true })` en `src/app.module.ts`, sin loader.
- Interfaz `Env` en `src/env.model.ts`: sus claves son los nombres de las variables del `.env` (`PORT`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`). Al agregar una variable, sumarla a `Env` y a `.env.example`.
- Leer valores con `ConfigService<Env>` y `getOrThrow('POSTGRES_HOST')`: si falta la variable la app no arranca, por eso hay que copiar `.env.example` a `.env` (`.env` esta en `.gitignore`, nunca commitearlo).

| Controller | Endpoints | Service |
|---|---|---|
| AuthController | POST /auth/registro, POST /auth/login, POST /auth/refresh | AuthService |
| UsuarioController | GET/PUT /usuarios/{id}/preferencias, GET/POST /usuarios/{id}/favoritos, DELETE /usuarios/{id}/favoritos/{ofertaId} | UsuarioService |
| BusquedaController | POST /busquedas, GET /busquedas/{id}, GET /busquedas/{id}/resultados | BusquedaService + ScoringService |
| ComparacionController | POST /comparaciones, GET /comparaciones/{id}, DELETE /comparaciones/{id} | ComparacionService |
| CatalogoController | GET /carreras, GET /carreras/{id}, GET /universidades, GET /ofertas/{id} | CatalogoService |

DTOs clave (nombres exactos del diagrama):

- `BusquedaRequestDTO`: carrera, ciudad, costoMax, modalidad, jornada, pesos.
- `ResultadoBusquedaDTO`: oferta + puntaje + desglose. Siempre incluir el desglose.
- `ComparacionRequestDTO`: ofertaIds[]. `ComparacionDTO`: tabla comparativa.
- `OfertaAcademicaDTO`: costo, modalidad, duracion, acreditacion, SNIES.
- `PreferenciaDTO`: pesos por criterio.

## Comandos

- Instalar: `npm install`
- Dev: `npm run start:dev` (http://localhost:3000)
- PostgreSQL (Docker): `docker compose up -d postgres`
- Build: `npm run build`
- Lint: `npm run lint` (revisa `src/` y `test/`)
- Tests: `npm test` (solo `src/**/*.spec.ts`)
- Un solo test: `npm test -- auth`
- E2E: `npm run test:e2e`
- Nota tests: jest corre en modo ESM (`NODE_OPTIONS=--experimental-vm-modules` ya incluido en los scripts) porque Nest 12 (`@nestjs/common`) es ESM puro. No quitar `tsconfig.spec.json` ni el override de transforms en `jest.config.ts` y `test/jest-e2e.json`.

## Docker y PostgreSQL

- Copiar las variables: `cp .env.example .env` (`.env` no se commitea).
- Solo la base de datos, para correr la API en local con `npm run start:dev`: `docker compose up -d postgres` (expone `localhost:5432` o `POSTGRES_PORT`).
- API y base de datos en contenedores: `docker compose up -d --build` (API en http://localhost:3000 o `PORT`). Dentro del contenedor la API usa `PORT=3000`, `POSTGRES_HOST=postgres` y `POSTGRES_PORT=5432`, que sobrescriben los valores de `.env`.
- TypeORM (`@nestjs/typeorm` + `pg`): `TypeOrmModule.forRootAsync` en `src/app.module.ts` con `useFactory` que lee las variables `POSTGRES_*` con `getOrThrow`. `autoLoadEntities: true`: cada modulo registra sus entidades con `TypeOrmModule.forFeature([...])`. `synchronize: true` (crea y actualiza las tablas desde las entidades).
- Los datos siguen siendo mock hasta que cada recurso migre a entidades y repositorios.
- La API y `npm run test:e2e` necesitan PostgreSQL arriba (`docker compose up -d postgres`). `npm test` no.
- pgAdmin: `docker compose up -d pgadmin` y abrir http://localhost:5050 (credenciales `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` del `.env`). El servidor "API SAN" (host `postgres`, puerto 5432) se precarga desde `docker/pgadmin/servers.json` la primera vez que se crea el volumen `pgadmin_data`; la contrasena de la base se pide al conectar.
- Si el puerto 5432 ya esta ocupado por un PostgreSQL local, cambiar `POSTGRES_PORT` en `.env` (por ejemplo 5433); Nest y Compose leen el mismo valor.
- Detener: `docker compose down`. Agregar `-v` solo si se quiere borrar el volumen `postgres_data`.