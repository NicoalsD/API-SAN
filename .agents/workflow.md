# Flujo de trabajo - ramas, commits y PR

## Ramas

- Base: `develop` (rama por defecto; esta protegida, no commitear directo).
- Trabajo: crear `feature/<nombre>` desde `develop` actualizado (`git pull` primero).
- Cada integrante sube su rama con su propia cuenta de GitHub (`gh auth switch --user <cuenta>`). No subir trabajo de otros.
- Al mergear el PR se puede borrar la rama.

## Commits

- Estilo convencional: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:` + descripcion corta en espanol.
- Ejemplo: `feat: agregar capa auth con registro y login`
- Minimo 1 commit por rama.

## Pull Requests

- Base siempre `develop`. Requiere 2 aprobaciones (ruleset de GitHub) para mergear.
- Las aprobaciones van sin comentarios: solo aprobar, sin body ni review comments.
- Plantilla obligatoria del cuerpo del PR:

~~~md
<img width="671" height="201" alt="image" src="https://github.com/user-attachments/assets/689ab860-f8d0-4235-ac19-f6f0b341c8ac" />

:construction_worker: Dev: <Nombre>

## Cambios (clases, archivos, etc)
* `ruta/archivo.ts:` Descripcion corta del cambio.

## Detalles
* Detalle tecnico 1.
* Detalle tecnico 2.

De branches:

feature/<nombre>

De commits:

feat: mensaje del commit
~~~

- El banner de la cooperativa va al inicio del cuerpo de todo PR.
- En `## Cambios` listar las clases y archivos tocados, con ruta y descripcion.