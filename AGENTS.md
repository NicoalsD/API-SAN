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
- Datos persistidos en PostgreSQL con TypeORM: cada Service usa su repositorio (`@InjectRepository`) y los IDs son UUID generados por la base de datos. El catalogo inicial se carga con `npm run seed` (`src/common/semilla.ts`).
- NO implementar todavia: Prisma, migraciones, Redis, integracion SNIES/MEN. Agregarlos solo si se pide.
- Nombres de clases, DTOs y rutas en espanol, iguales al diagrama. No renombrar.
- Simplicidad: seguir el estilo de `IvonneBarco/book-nestjs-5b` (DTOs con class-validator, excepciones de Nest con mensajes en espanol, respuestas `{ message, data }` o `{ msg }`).
- Excepciones: lanzarlas en los Services con las clases de Nest (`NotFoundException`, `ConflictException`, `BadRequestException`, `UnauthorizedException`) y mensajes en espanol. Los controllers no validan a mano: el `ValidationPipe` global responde 400.

## Estructura (capas)

- Una carpeta por recurso en `src/`: `auth/`, `usuarios/`, `busquedas/`, `catalogo/`, `comparacion/`.
- Archivos por recurso: `<recurso>.controller.ts`, `<recurso>.service.ts`, `<singular>.dto.ts`, `<singular>.module.ts`, `<singular>.entity.ts` (todas las clases Dto del recurso en ese unico archivo). Excepcion: los DTOs del perfil viven en `usuarios/perfil.dto.ts` (como `dtos/profile.dto.ts` en `book-nestjs-5a`) para evitar un import circular entre `auth.dto.ts` y `usuario.dto.ts`.
- Modulos de Nest: cada recurso migra a su propio `<singular>.module.ts` (clase `<Singular>Module`, en espanol) que registra su controller y service y exporta el service; `src/app.module.ts` solo lo importa. Todos los recursos tienen modulo: `AuthModule`, `UsuarioModule`, `BusquedaModule`, `CatalogoModule`, `ComparacionModule`; `ComparacionModule` importa `CatalogoModule`.
- `src/main.ts` habilita CORS para el origen de `CORS_ORIGIN` y usa `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform` (campos no declarados en el DTO responden 400; query y params se convierten a su tipo) y escucha en `process.env.PORT ?? 3000`.

## Autenticacion y roles (JWT, sin passport)

- `@nestjs/jwt` + `bcrypt`. `AuthModule` registra `JwtModule.registerAsync` (global) con `JWT_SECRET` / `JWT_EXPIRES_IN` y exporta los guards; los modulos que los usan (`UsuarioModule`, `CatalogoModule`) importan `AuthModule`.
- `AuthService`: la clave se guarda con `bcrypt.hash(clave, 10)` y el login usa `bcrypt.compare`. `accessToken` = JWT `{ sub, correo, rol }`; `refreshToken` = JWT `{ sub }` firmado con `JWT_REFRESH_SECRET` (`verifyAsync`, si falla `UnauthorizedException('Refresh token invalido')`). `AuthResponseDto` = `{ accessToken, refreshToken, usuario: { id, nombre, correo, rol } }` dentro de `{ message, data }`.
- `ROLES = ['estudiante', 'admin']` y type `Rol` en `src/common/constantes.ts`; `Usuario.rol` por defecto `estudiante`. El registro nunca asigna `admin`. `UsuarioService.actualizar` hashea la clave si cambia. Nunca devolver `clave`.
- Guards en `src/auth/`: `JwtAuthGuard` (Bearer, deja el payload en `request.usuario`, 401 en espanol), `RolesGuard` + `@Roles(...)` (403 en espanol), `PropietarioGuard` (en `/usuarios/:id...` exige `sub === id` o rol admin, si no 403) y el decorador `@UsuarioActual()`.
- Proteccion: todo `UsuarioController` con `JwtAuthGuard` + `PropietarioGuard`; `POST`/`PUT`/`DELETE` del catalogo con `JwtAuthGuard` + `RolesGuard` y `@Roles('admin')`. Publicos: lecturas del catalogo, `/busquedas`, `/comparaciones` y `/auth`.
- Credenciales demo (semilla, idempotente, claves con hash): `nicolas@correo.com` / `12345678` (estudiante, id `IDS_SEMILLA.usuario`) y `admin@correo.com` / `admin12345` (admin, id `IDS_SEMILLA.admin`).
- E2E: `test/jest-e2e.json` corre con `maxWorkers: 1` (las suites comparten BD y la semilla/sincronizacion no deben correr en paralelo).

## Configuracion (variables de entorno)

- Igual que `IvonneBarco/book-nestjs-5a`: `ConfigModule.forRoot({ isGlobal: true })` en `src/app.module.ts`, sin loader.
- Interfaz `Env` en `src/env.model.ts`: sus claves son los nombres de las variables del `.env` (`PORT`, `CORS_ORIGIN`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`). Al agregar una variable, sumarla a `Env` y a `.env.example`.
- Leer valores con `ConfigService<Env>` y `getOrThrow('POSTGRES_HOST')`: si falta la variable la app no arranca, por eso hay que copiar `.env.example` a `.env` (`.env` esta en `.gitignore`, nunca commitearlo).

| Controller | Endpoints | Service |
|---|---|---|
| AuthController | POST /auth/registro, POST /auth/login, POST /auth/refresh (publicos) | AuthService |
| UsuarioController (JWT, propio usuario o admin) | GET/PUT /usuarios/{id}, GET/PUT /usuarios/{id}/preferencias, GET/POST /usuarios/{id}/favoritos, DELETE /usuarios/{id}/favoritos/{ofertaId} | UsuarioService |
| BusquedaController | POST /busquedas, GET /busquedas/{id}, GET /busquedas/{id}/resultados | BusquedaService + ScoringService |
| ComparacionController | POST /comparaciones, GET /comparaciones/{id}, DELETE /comparaciones/{id} | ComparacionService |
| CatalogoController (POST/PUT/DELETE solo admin) | GET/POST /carreras, GET/PUT/DELETE /carreras/{id}, GET/POST /universidades, GET/PUT/DELETE /universidades/{id}, GET/POST /ofertas (filtros carreraId, universidadId, ciudad), GET/PUT/DELETE /ofertas/{id} | CatalogoService |

DTOs clave (nombres exactos del diagrama):

- `BusquedaRequestDTO`: carrera, ciudad, costoMax, modalidad, jornada, pesos.
- `ResultadoBusquedaDTO`: oferta + puntaje + desglose. Siempre incluir el desglose.
- `ComparacionRequestDTO`: ofertaIds[]. `ComparacionDTO`: tabla comparativa.
- `OfertaAcademicaDTO`: id, universidadId, carreraId, universidad, carrera, imagenUrl (de la universidad), ciudad, costo, modalidad, duracion, jornada, acreditacion, SNIES.
- `CrearCarreraDto` / `CrearUniversidadDto` (con `imagenUrl` opcional) / `CrearOfertaDto` (relaciones por `universidadId` y `carreraId`) y sus `Actualizar...Dto` (`PartialType`); `FiltroOfertaDto`. CRUD del catalogo: buscar o validar (404), `merge` + `save`, relaciones como `universidad: { id }`, duplicados de nombre/SNIES responden 409; las escrituras responden `{ message, data }`.
- `PreferenciaDTO`: pesos por criterio.
- `CrearPerfilDto` / `ActualizarPerfilDto` (`PartialType`): apellido, ciudad, avatar. `RegistroDto.perfil` es obligatorio y anidado (`@ValidateNested` + `@Type`).
- `ActualizarUsuarioDto`: `PartialType(OmitType(RegistroDto, ['perfil']))` + `perfil` opcional de tipo `ActualizarPerfilDto` (importados de `@nestjs/swagger` para que Swagger herede las propiedades; la Clase 7b de `book-nestjs-5a` usa `@nestjs/mapped-types`).
- Actualizar con relaciones: buscar con `relations: { perfil: true }`, aplicar cambios con `repository.merge` y guardar con `save` (el `cascade` actualiza el perfil existente). Nunca devolver `clave` en las respuestas.

## Comandos

- Instalar: `npm install`
- Cargar catalogo inicial: `npm run seed` (con PostgreSQL arriba y `.env` configurado)
- Dev: `npm run start:dev` (http://localhost:3000)
- Swagger UI: http://localhost:3000/docs (esquema JSON en `/docs-json`; con la API arriba)
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
- Entidades (TypeORM, nombres en espanol, `@PrimaryGeneratedColumn('uuid')`), cada una registrada con `TypeOrmModule.forFeature` en su modulo:
  - `catalogo/carrera.entity.ts` (`Carrera`, tabla `carreras`) y `catalogo/universidad.entity.ts` (`Universidad`, tabla `universidades`, con `imagenUrl` opcional): 1:N con `OfertaAcademica`.
  - `catalogo/oferta-academica.entity.ts` (`OfertaAcademica`, tabla `ofertas_academicas`): snies unico, ciudad, costo, modalidad, jornada, duracion, acreditacion; N:1 con `Universidad` y `Carrera`.
  - `usuarios/usuario.entity.ts` (`Usuario`, tabla `usuarios`): nombre, correo unico, clave (hash bcrypt), rol (`estudiante` por defecto o `admin`), preferencias (jsonb), favoritos N:M con `OfertaAcademica` (tabla `usuario_favoritos`), perfil 1:1 opcional con `Perfil` (`@OneToOne` con `cascade: true` y `@JoinColumn` `perfil_id`).
  - `usuarios/perfil.entity.ts` (`Perfil`, tabla `perfiles`): apellido, ciudad, avatar opcional, `fechaRegistro` (`@CreateDateColumn`) y `fechaActualizacion` (`@UpdateDateColumn`). Se crea junto con el usuario en `POST /auth/registro` gracias al `cascade`.
  - `busquedas/busqueda.entity.ts` (`Busqueda`, tabla `busquedas`): filtros y resultados (jsonb), N:1 opcional con `Usuario`.
  - `comparacion/comparacion.entity.ts` (`Comparacion`, tabla `comparaciones`): ofertas N:M (tabla `comparacion_ofertas`), tabla (jsonb), `mejorOferta` N:1.
- Las propiedades de relacion usan `Relation<...>` de typeorm para evitar errores por imports circulares con `emitDecoratorMetadata`.
- Los Services usan repositorios (`@InjectRepository`), no arreglos en memoria. `src/common/semilla.ts` carga de forma idempotente 5 carreras, 7 universidades (Bogota, Medellin, Cali y Barranquilla), sus ofertas (SNIES unicos) y el usuario demo; se ejecuta con `npm run seed` y en las pruebas e2e.
- La API y `npm run test:e2e` necesitan PostgreSQL arriba (`docker compose up -d postgres`). `npm test` no: usa repositorios simulados.
- pgAdmin: `docker compose up -d pgadmin` y abrir http://localhost:5050 (credenciales `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` del `.env`). El servidor "API SAN" (host `postgres`, puerto 5432) se precarga desde `docker/pgadmin/servers.json` la primera vez que se crea el volumen `pgadmin_data`; la contrasena de la base se pide al conectar.
- Si el puerto 5432 ya esta ocupado por un PostgreSQL local, cambiar `POSTGRES_PORT` en `.env` (por ejemplo 5433); Nest y Compose leen el mismo valor.
- Detener: `docker compose down`. Agregar `-v` solo si se quiere borrar el volumen `postgres_data`.