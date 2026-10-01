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
- Plantilla obligatoria del cuerpo del PR:

~~~md
:construction_worker: Dev: <Nombre>

## Cambios (clases, archivos, etc)
* `ruta/archivo.ts:` Descripcion corta del cambio.

## Detalles
* Detalle tecnico 1.
* Detalle tecnico 2.

## Pantallazos funcionalidades
<img width="683" height="379" alt="image" src="https://github.com/user-attachments/assets/9cd257a0-6cb8-4863-a00b-b18da84166f1" />

De branches:

feature/<nombre>

De commits:

feat: mensaje del commit
~~~

- El banner (imagen) siempre debe ir; capturas adicionales dependen de los cambios.
- En `## Cambios` listar las clases y archivos tocados, con ruta y descripcion.