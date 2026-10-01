# AGENTS.md - API SAN (Sistema Academico de Navegacion)

API REST en NestJS para busqueda, consulta y comparacion de ofertas academicas: dada una carrera y parametros del usuario (ubicacion, costo, modalidad, jornada, etc.) identifica las universidades que la ofrecen y las ordena por afinidad.

## Git (obligatorio)

- ANTES de cualquier cambio: `git pull` sobre `develop` para evitar conflictos. Si hay cambios sin commitear, resolver o preguntar antes de continuar.
- Rama por defecto: `develop`. No trabajar directo sobre ella; crear `feature/<nombre>` desde `develop`.
- Remoto: https://github.com/NicoalsD/API-SAN.git
- Reglas de ramas, commits y plantilla de PR: `.agents/workflow.md`. Todo PR necesita 2 aprobaciones para mergear (ruleset de GitHub).

## Alcance actual (respetar)

- Arquitectura por capas: Controller (solo HTTP y mapeo request/response), Service (toda la logica), DTOs.
- Datos en memoria dentro de los Services (mock). NO implementar todavia: base de datos, ORM (TypeORM/Prisma), repositorios, migraciones, Redis, integracion SNIES/MEN, JWT/BCrypt real. Agregarlos solo si se pide.
- Nombres de clases, DTOs y rutas en espanol, iguales al diagrama. No renombrar.
- Simplicidad: seguir el estilo de `IvonneBarco/book-nestjs-5b` (DTOs con class-validator, excepciones de Nest con mensajes en espanol, respuestas `{ message, data }` o `{ msg }`).

## Estructura (capas)

- Una carpeta por recurso en `src/`: `auth/`, `usuarios/`, `busquedas/`, `catalogo/`, `comparacion/`.
- Archivos por recurso: `<recurso>.controller.ts`, `<recurso>.service.ts`, `<singular>.dto.ts` (todas las clases Dto del recurso en ese unico archivo).
- Sin archivo `<recurso>.module.ts`: registrar controllers y providers directo en `src/app.module.ts` (como la profe).
- `src/main.ts` usa `ValidationPipe` global.

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
- Build: `npm run build`
- Lint: `npm run lint` (revisa `src/` y `test/`)
- Tests: `npm test` (solo `src/**/*.spec.ts`)
- Un solo test: `npm test -- auth`
- E2E: `npm run test:e2e`