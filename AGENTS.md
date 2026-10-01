# AGENTS.md - API SAN (Sistema Academico de Navegacion)

API REST en NestJS para busqueda, consulta y comparacion de ofertas academicas: dada una carrera y parametros del usuario (ubicacion, costo, modalidad, jornada, etc.) identifica las universidades que la ofrecen y las ordena por afinidad.

## Git (obligatorio)

- ANTES de cualquier cambio: `git pull` sobre `develop` para evitar conflictos. Si hay cambios sin commitear, resolver o preguntar antes de continuar.
- Rama por defecto: `develop`. No trabajar directo sobre ella; crear `feature/<nombre>` desde `develop`.
- Remoto: https://github.com/NicoalsD/API-SAN.git

## Alcance actual (respetar)

- Implementar solo Controllers, DTOs y Services, simples.
- NO implementar todavia: base de datos, ORM (TypeORM/Prisma), repositorios, migraciones, Redis, integracion SNIES/MEN, JWT/BCrypt real. Agregarlos solo si se pide.
- El proyecto aun no tiene `package.json`; se inicializa con NestJS cuando se indique.
- Nombres de clases, DTOs y rutas en espanol, iguales al diagrama. No renombrar.

## Capas (arquitectura por capas del diagrama)

- Controller: solo HTTP y mapeo request/response. Sin logica de negocio ni acceso a datos.
- Service: filtros, scoring y comparacion viven aqui. `BusquedaService` usa `ScoringService`.
- DTO: Request y Response separados, un archivo por DTO.

| Controller | Endpoints | Service |
|---|---|---|
| AuthController | POST /auth/registro, POST /auth/login, POST /auth/refresh | AuthService |
| UsuarioController | GET/PUT /usuarios/{id}/preferencias, GET/POST/DELETE /favoritos | UsuarioService |
| BusquedaController | POST /busquedas, GET /busquedas/{id}, GET /busquedas/{id}/resultados | BusquedaService + ScoringService |
| ComparacionController | POST /comparaciones, GET /comparaciones/{id}, DELETE /comparaciones/{id} | ComparacionService |
| CatalogoController | GET /carreras, GET /carreras/{id}, GET /universidades, GET /ofertas/{id} | CatalogoService |

DTOs clave (nombres exactos del diagrama):

- `BusquedaRequestDTO`: carrera, ciudad, costoMax, modalidad, jornada, pesos.
- `ResultadoBusquedaDTO`: oferta + puntaje + desglose. Siempre incluir el desglose.
- `ComparacionRequestDTO`: ofertaIds[]. `ComparacionDTO`: tabla comparativa.
- `OfertaAcademicaDTO`: costo, modalidad, duracion, acreditacion, SNIES.
- `PreferenciaDTO`: pesos por criterio.

## Comandos (NestJS estandar, cuando exista package.json)

- Dev: `npm run start:dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Tests: `npm test`
- Un solo test: `npm test -- busqueda.service`

## Convencion de Pull Request (obligatoria)

Plantilla del cuerpo del PR:

```md
:construction_worker: Dev: <Nombre>

## Cambios (clases, archivos, etc)
* `ruta/archivo.ts:` Descripcion corta del cambio.

## Detalles
* Detalle tecnico 1.
* Detalle tecnico 2.

## Pantallazos funcionalidades
<img width="683" height="379" alt="image" src="https://github.com/user-attachments/assets/<id>" />

De branches:

feature/<nombre>

De commits:

fix: mensaje del commit
```

Reglas:

- Ramas con prefijo `feature/<nombre>` (ej. `feature/styles`).
- Commits estilo conventional: `fix:`, `feat:`, `docs:`, etc.
- El banner (imagen) siempre va; las capturas adicionales dependen de los cambios.
- En `## Cambios` listar las clases y archivos tocados, con ruta y descripcion.