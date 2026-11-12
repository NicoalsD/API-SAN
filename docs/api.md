# Referencia de la API

Base URL: `http://localhost:3000` (o el valor de `PORT`). No hay prefijo global: las rutas cuelgan de la raiz (`/carreras`, `/busquedas`, etc.). Los cuerpos son JSON (`Content-Type: application/json`).

La documentacion interactiva (Swagger UI) esta en http://localhost:3000/docs y el esquema OpenAPI en JSON en http://localhost:3000/docs-json. Los endpoints protegidos usan `Authorization: Bearer <accessToken>` (boton "Authorize" en Swagger).

## Convenciones

- **Validacion**: `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`. Un campo del body o de la query que no este declarado en el DTO responde 400. Query y params se convierten a su tipo.
- **IDs**: los parametros `:id` y `:ofertaId` deben ser UUID. Si no lo son, responde 400 (`ParseUUIDPipe`).
- **Codigos de estado**: los POST responden 201 (valor por defecto de NestJS). GET, PUT y DELETE responden 200.
- **Formato de error** (estandar de NestJS):

  ```json
  { "message": "Usuario con ID 00000000-0000-4000-8000-000000000099 no existe", "error": "Not Found", "statusCode": 404 }
  ```

  En errores de validacion, `message` es un arreglo con los mensajes de class-validator. Los DTOs no tienen mensajes personalizados, asi que salen en ingles:

  ```json
  { "message": ["correo must be an email"], "error": "Bad Request", "statusCode": 400 }
  ```

- **Forma de la respuesta**: algunos endpoints devuelven `{ "message", "data" }` y otros el recurso directamente. Cada seccion lo indica.
- **Autenticacion**: JWT con el header `Authorization: Bearer <accessToken>`. Ver la seccion [Autenticacion y roles](#autenticacion-y-roles). Sin token o con token invalido responde 401; sin permiso responde 403.
- **Escrituras del catalogo**: `POST`, `PUT` y `DELETE` de carreras, universidades y ofertas devuelven `{ "message", "data" }` (el `DELETE` solo `message`). Las lecturas siguen devolviendo el recurso directo.

### Endpoints

| Grupo | Metodo | Ruta | Descripcion |
|---|---|---|---|
| Auth | POST | `/auth/registro` | Registra un usuario y devuelve tokens |
| Auth | POST | `/auth/login` | Inicia sesion y devuelve tokens |
| Auth | POST | `/auth/refresh` | Renueva los tokens con un refresh token |
| Usuarios | GET | `/usuarios/{id}` | Consulta el usuario con su perfil |
| Usuarios | PUT | `/usuarios/{id}` | Actualiza datos del usuario y su perfil |
| Usuarios | GET | `/usuarios/{id}/preferencias` | Consulta las preferencias del usuario |
| Usuarios | PUT | `/usuarios/{id}/preferencias` | Actualiza las preferencias del usuario |
| Usuarios | GET | `/usuarios/{id}/favoritos` | Lista los IDs de ofertas favoritas |
| Usuarios | POST | `/usuarios/{id}/favoritos` | Agrega una oferta a favoritos |
| Usuarios | DELETE | `/usuarios/{id}/favoritos/{ofertaId}` | Quita una oferta de favoritos |
| Busquedas | POST | `/busquedas` | Crea una busqueda y calcula los resultados ordenados |
| Busquedas | GET | `/busquedas/{id}` | Consulta el resumen de una busqueda |
| Busquedas | GET | `/busquedas/{id}/resultados` | Consulta los resultados de una busqueda |
| Comparaciones | POST | `/comparaciones` | Compara de 2 a 4 ofertas |
| Comparaciones | GET | `/comparaciones/{id}` | Consulta una comparacion |
| Comparaciones | DELETE | `/comparaciones/{id}` | Elimina una comparacion |
| Catalogo | GET | `/carreras` | Lista carreras (filtro `?nombre=`) |
| Catalogo | GET | `/carreras/{id}` | Consulta una carrera |
| Catalogo | POST | `/carreras` | Crea una carrera |
| Catalogo | PUT | `/carreras/{id}` | Actualiza una carrera |
| Catalogo | DELETE | `/carreras/{id}` | Elimina una carrera y sus ofertas |
| Catalogo | GET | `/universidades` | Lista universidades (filtro `?ciudad=`) |
| Catalogo | GET | `/universidades/{id}` | Consulta una universidad con sus ofertas |
| Catalogo | POST | `/universidades` | Crea una universidad |
| Catalogo | PUT | `/universidades/{id}` | Actualiza una universidad |
| Catalogo | DELETE | `/universidades/{id}` | Elimina una universidad y sus ofertas |
| Catalogo | GET | `/ofertas` | Lista ofertas (filtros `?carreraId=`, `?universidadId=`, `?ciudad=`) |
| Catalogo | GET | `/ofertas/{id}` | Consulta una oferta academica |
| Catalogo | POST | `/ofertas` | Crea una oferta academica |
| Catalogo | PUT | `/ofertas/{id}` | Actualiza una oferta academica |
| Catalogo | DELETE | `/ofertas/{id}` | Elimina una oferta academica |

### Datos de ejemplo (seed)

Los ejemplos de este documento usan los datos de `npm run seed`. Usuario demo (estudiante): `nicolas@correo.com` / `12345678`. Admin demo: `admin@correo.com` / `admin12345`.

| Entidad | Nombre | ID |
|---|---|---|
| Usuario demo | nicolas@correo.com | `00000000-0000-4000-8000-000000000001` |
| Admin demo | admin@correo.com | `00000000-0000-4000-8000-000000000002` |
| Carrera | Ingenieria de Sistemas | `00000000-0000-4000-8000-000000000011` |
| Carrera | Derecho | `00000000-0000-4000-8000-000000000012` |
| Carrera | Medicina | `00000000-0000-4000-8000-000000000013` |
| Universidad | Universidad Nacional de Colombia (Bogota) | `00000000-0000-4000-8000-000000000021` |
| Universidad | Universidad de los Andes (Bogota) | `00000000-0000-4000-8000-000000000022` |
| Universidad | Universidad Javeriana (Bogota) | `00000000-0000-4000-8000-000000000023` |
| Universidad | Universidad de Antioquia (Medellin) | `00000000-0000-4000-8000-000000000024` |
| Universidad | Universidad EAFIT (Medellin) | `00000000-0000-4000-8000-000000000025` |
| Oferta | Nacional - Ingenieria de Sistemas | `00000000-0000-4000-8000-000000000101` |
| Oferta | Andes - Ingenieria de Sistemas | `00000000-0000-4000-8000-000000000102` |
| Oferta | Javeriana - Derecho | `00000000-0000-4000-8000-000000000103` |
| Oferta | Antioquia - Medicina | `00000000-0000-4000-8000-000000000104` |
| Oferta | EAFIT - Ingenieria de Sistemas | `00000000-0000-4000-8000-000000000105` |

---

## Autenticacion y roles

- `accessToken`: JWT con payload `{ sub, correo, rol }`, firmado con `JWT_SECRET` y valido `JWT_EXPIRES_IN` (por defecto `15m`). Se envia en `Authorization: Bearer <accessToken>`.
- `refreshToken`: JWT con payload `{ sub }`, firmado con `JWT_REFRESH_SECRET` y valido `JWT_REFRESH_EXPIRES_IN` (por defecto `7d`). Solo sirve en `POST /auth/refresh`.
- Roles: `estudiante` (por defecto en el registro) y `admin`. El registro nunca asigna `admin`.
- Las claves se guardan con hash (bcrypt) y nunca se devuelven.

| Endpoints | Acceso |
|---|---|
| `/auth/*`, `/busquedas*`, `/comparaciones*`, `GET` del catalogo | Publicos |
| `/usuarios/{id}...` (todos) | Token valido. Solo el propio usuario (`sub === id`) o un `admin`; si no, 403 |
| `POST`, `PUT`, `DELETE` de `/carreras`, `/universidades` y `/ofertas` | Token valido con rol `admin`; un estudiante recibe 403 |

Errores de acceso (formato estandar de NestJS):

| Codigo | Mensaje |
|---|---|
| 401 | `Token de acceso requerido` (sin header o esquema distinto de Bearer) |
| 401 | `Token de acceso invalido o expirado` |
| 403 | `No tienes permisos para esta accion` (rol insuficiente en el catalogo) |
| 403 | `No puedes acceder a los datos de otro usuario` |

Forma de `data` en registro, login y refresh (`AuthResponseDto`):

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "usuario": {
    "id": "00000000-0000-4000-8000-000000000001",
    "nombre": "Nicolas",
    "correo": "nicolas@correo.com",
    "rol": "estudiante"
  }
}
```

---

## Auth

### POST /auth/registro

Registra un usuario nuevo junto con su perfil (relacion 1:1 guardada en cascada).

**Body** (`RegistroDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Requerido, no vacio, maximo 100 caracteres |
| `correo` | string | Requerido, formato de correo valido, maximo 150 caracteres. Debe ser unico |
| `clave` | string | Requerido, minimo 8 caracteres |
| `perfil` | objeto (`CrearPerfilDto`) | Requerido, se valida anidado |
| `perfil.apellido` | string | Requerido, no vacio, maximo 100 caracteres |
| `perfil.ciudad` | string | Requerido, no vacio, maximo 100 caracteres |
| `perfil.avatar` | string | Opcional, URL valida, maximo 255 caracteres |

**Respuesta 201**

```json
{
  "message": "Usuario registrado correctamente",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "usuario": { "id": "7c1e9a52-3b8d-4f2e-9a61-2d5c8e4b1f70", "nombre": "Ana", "correo": "ana@correo.com", "rol": "estudiante" }
  }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | Campos faltantes, formato invalido o campos no declarados |
| 409 | `El correo <correo> ya esta registrado` |

Nota: la clave se guarda con hash bcrypt (10 rondas). El usuario siempre se crea con rol `estudiante`; enviar `rol` responde 400.

**Ejemplo**

```bash
curl -X POST http://localhost:3000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","correo":"ana@correo.com","clave":"clave12345","perfil":{"apellido":"Lopez","ciudad":"Bogota"}}'
```

### POST /auth/login

Inicia sesion con correo y clave.

**Body** (`LoginDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `correo` | string | Requerido, formato de correo valido |
| `clave` | string | Requerido, no vacio |

**Respuesta 201**

```json
{
  "message": "Ingreso exitoso",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "usuario": { "id": "00000000-0000-4000-8000-000000000001", "nombre": "Nicolas", "correo": "nicolas@correo.com", "rol": "estudiante" }
  }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | Campos faltantes o formato invalido |
| 401 | `Correo o clave incorrectos` (la clave se compara con bcrypt) |

**Ejemplo**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"nicolas@correo.com","clave":"12345678"}'
```

### POST /auth/refresh

Renueva los tokens. El `refreshToken` debe ser un JWT de refresh vigente (firmado con `JWT_REFRESH_SECRET`); un access token no sirve. Se vuelve a consultar al usuario, asi que el nuevo `accessToken` lleva el rol actual.

**Body** (`RefreshDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `refreshToken` | string | Requerido, no vacio |

**Respuesta 201**

```json
{
  "message": "Token renovado",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "usuario": { "id": "00000000-0000-4000-8000-000000000001", "nombre": "Nicolas", "correo": "nicolas@correo.com", "rol": "estudiante" }
  }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `refreshToken` faltante o vacio |
| 401 | `Refresh token invalido` (firma incorrecta, expirado, malformado o usuario inexistente) |

**Ejemplo**

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"refresh-00000000-0000-4000-8000-000000000001"}'
```

---

## Usuarios

Todos los endpoints de este grupo reciben `:id` (UUID del usuario). Requieren `Authorization: Bearer <accessToken>` y que `sub === id` (o rol `admin`): sin token responden 401 y con el token de otro usuario 403. Si el usuario no existe, responden 404 con `Usuario con ID <id> no existe`.

En los ejemplos `curl` de este grupo, agregar `-H "Authorization: Bearer $TOKEN"`.

### GET /usuarios/{id}

Devuelve el usuario con su perfil (`relations: { perfil: true }`). La clave nunca se incluye.

**Respuesta 200**

```json
{
  "message": "Usuario encontrado",
  "data": {
    "id": "00000000-0000-4000-8000-000000000001",
    "nombre": "Nicolas",
    "correo": "nicolas@correo.com",
    "preferencias": { "costo": 3, "modalidad": 3, "ubicacion": 3, "acreditacion": 3 },
    "perfil": { "id": "...", "apellido": "Diaz", "ciudad": "Bogota", "avatar": null },
    "fechaRegistro": "...",
    "fechaActualizacion": "..."
  }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es un UUID |
| 404 | `Usuario con ID <id> no existe` |

**Ejemplo**

```bash
curl http://localhost:3000/usuarios/00000000-0000-4000-8000-000000000001
```

### PUT /usuarios/{id}

Actualiza parcialmente el usuario y su perfil. Todos los campos son opcionales.

**Body** (`ActualizarUsuarioDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Opcional, maximo 100 caracteres |
| `correo` | string | Opcional, correo valido, maximo 150 caracteres. Debe ser unico |
| `clave` | string | Opcional, minimo 8 caracteres |
| `perfil` | objeto (`ActualizarPerfilDto`) | Opcional; `apellido`, `ciudad` y `avatar` opcionales con las mismas reglas del registro |

Si el usuario no tenia perfil, para crearlo se requieren `apellido` y `ciudad`.

**Respuesta 200**: `{ "message": "Usuario actualizado correctamente", "data": <usuario con perfil, sin clave> }`

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | Campos invalidos o no declarados, o perfil nuevo sin apellido y ciudad |
| 404 | `Usuario con ID <id> no existe` |
| 409 | `El correo <correo> ya esta registrado` |

**Ejemplo**

```bash
curl -X PUT http://localhost:3000/usuarios/00000000-0000-4000-8000-000000000001 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Nico","perfil":{"ciudad":"Medellin"}}'
```

### GET /usuarios/{id}/preferencias

Devuelve el objeto de preferencias directamente (sin `message` ni `data`). Los usuarios nuevos arrancan con 3 en cada criterio.

**Respuesta 200**

```json
{ "costo": 3, "modalidad": 3, "ubicacion": 3, "acreditacion": 3 }
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | Usuario no existe |

**Ejemplo**

```bash
curl http://localhost:3000/usuarios/00000000-0000-4000-8000-000000000001/preferencias
```

### PUT /usuarios/{id}/preferencias

Reemplaza las preferencias. Los cuatro campos son obligatorios.

**Body** (`PreferenciaDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `costo` | integer | Requerido, entre 0 y 5 |
| `modalidad` | integer | Requerido, entre 0 y 5 |
| `ubicacion` | integer | Requerido, entre 0 y 5 |
| `acreditacion` | integer | Requerido, entre 0 y 5 |

**Respuesta 200**

```json
{
  "message": "Preferencias actualizadas",
  "data": { "costo": 4, "modalidad": 2, "ubicacion": 5, "acreditacion": 3 }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | Falta un campo, valor fuera de 0-5, no entero o campo no declarado |
| 404 | Usuario no existe |

**Ejemplo**

```bash
curl -X PUT http://localhost:3000/usuarios/00000000-0000-4000-8000-000000000001/preferencias \
  -H "Content-Type: application/json" \
  -d '{"costo":4,"modalidad":2,"ubicacion":5,"acreditacion":3}'
```

### GET /usuarios/{id}/favoritos

Devuelve la lista de IDs de ofertas favoritas. Es `[]` si no tiene favoritos.

**Respuesta 200**

```json
["00000000-0000-4000-8000-000000000101"]
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | Usuario no existe |

**Ejemplo**

```bash
curl http://localhost:3000/usuarios/00000000-0000-4000-8000-000000000001/favoritos
```

### POST /usuarios/{id}/favoritos

Agrega una oferta a los favoritos del usuario.

**Body** (`FavoritoDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `ofertaId` | string (UUID) | Requerido, no vacio |

**Respuesta 201**

```json
{
  "message": "Favorito agregado",
  "data": ["00000000-0000-4000-8000-000000000101"]
}
```

`data` contiene la lista completa de IDs favoritos despues de agregar.

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` o `ofertaId` no son UUID |
| 404 | `Usuario con ID <id> no existe` o `Oferta con ID <ofertaId> no existe` |
| 409 | `La oferta <ofertaId> ya esta en favoritos` |

**Ejemplo**

```bash
curl -X POST http://localhost:3000/usuarios/00000000-0000-4000-8000-000000000001/favoritos \
  -H "Content-Type: application/json" \
  -d '{"ofertaId":"00000000-0000-4000-8000-000000000101"}'
```

### DELETE /usuarios/{id}/favoritos/{ofertaId}

Quita una oferta de los favoritos del usuario.

**Respuesta 200**

```json
{ "message": "Favorito eliminado", "data": [] }
```

`data` contiene los IDs favoritos que quedan.

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` u `ofertaId` no son UUID |
| 404 | `Usuario con ID <id> no existe` o `La oferta <ofertaId> no esta en favoritos` |

**Ejemplo**

```bash
curl -X DELETE http://localhost:3000/usuarios/00000000-0000-4000-8000-000000000001/favoritos/00000000-0000-4000-8000-000000000101
```

---

## Busquedas

### POST /busquedas

Busca las ofertas que cumplen los filtros, calcula el puntaje de cada una y guarda la busqueda. Los resultados salen ordenados de mayor a menor puntaje.

**Body** (`BusquedaRequestDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `carrera` | string | Requerido, no vacio. Es el **nombre** de la carrera (no el ID), sin distinguir mayusculas. Ejemplo: `Ingenieria de Sistemas` |
| `ciudad` | string | Opcional. Filtra por ciudad sin distinguir mayusculas. El criterio `ubicacion` del puntaje compara el texto exacto |
| `costoMax` | integer | Opcional, minimo 0. Excluye las ofertas con costo mayor |
| `modalidad` | string | Opcional: `presencial`, `virtual` o `hibrida`. Filtra |
| `jornada` | string | Opcional: `diurna`, `nocturna` o `mixta`. Filtra |
| `pesos` | objeto `PreferenciaDto` | Opcional. Si se envia, `costo`, `modalidad`, `ubicacion` y `acreditacion` son obligatorios (enteros de 0 a 5). Si no se envia, cada criterio pesa 1 |
| `usuarioId` | string (UUID) | Opcional. Si se envia debe existir, y la busqueda queda asociada a ese usuario |

Los filtros `carrera`, `ciudad`, `costoMax`, `modalidad` y `jornada` son excluyentes: una oferta que no los cumple se omite.

**Puntaje**: promedio ponderado de cuatro criterios por 100, redondeado. Cada criterio vale entre 0 y 1:

- `costo`: 1 si no hay `costoMax`; si lo hay, `max(0, 1 - costo / costoMax)`.
- `modalidad`: 1 si no hay filtro o coincide, 0 si no.
- `ubicacion`: 1 si no hay `ciudad` o coincide exactamente, 0 si no.
- `acreditacion`: 1 si la oferta esta acreditada, 0 si no.

Si la suma de los pesos es 0, el puntaje es 0.

**Respuesta 201**

```json
{
  "message": "Busqueda realizada correctamente",
  "data": {
    "id": "5b0e7d1c-8a42-4f9e-b6d3-1e2f9a7c4d80",
    "total": 3,
    "resultados": [
      {
        "oferta": {
          "id": "00000000-0000-4000-8000-000000000101",
          "universidadId": "00000000-0000-4000-8000-000000000021",
          "carreraId": "00000000-0000-4000-8000-000000000011",
          "universidad": "Universidad Nacional de Colombia",
          "carrera": "Ingenieria de Sistemas",
          "imagenUrl": "/campus/nacional.webp",
          "ciudad": "Bogota",
          "costo": 4500000,
          "modalidad": "presencial",
          "jornada": "diurna",
          "duracion": 10,
          "acreditacion": true,
          "snies": "1001"
        },
        "puntaje": 96,
        "desglose": { "costo": 0.8200000000000001, "modalidad": 1, "ubicacion": 1, "acreditacion": 1 }
      },
      {
        "oferta": {
          "id": "00000000-0000-4000-8000-000000000102",
          "universidadId": "00000000-0000-4000-8000-000000000022",
          "carreraId": "00000000-0000-4000-8000-000000000011",
          "universidad": "Universidad de los Andes",
          "carrera": "Ingenieria de Sistemas",
          "imagenUrl": "/campus/andes.webp",
          "ciudad": "Bogota",
          "costo": 22000000,
          "modalidad": "presencial",
          "jornada": "diurna",
          "duracion": 9,
          "acreditacion": true,
          "snies": "1002"
        },
        "puntaje": 78,
        "desglose": { "costo": 0.12, "modalidad": 1, "ubicacion": 1, "acreditacion": 1 }
      },
      {
        "oferta": {
          "id": "00000000-0000-4000-8000-000000000105",
          "universidadId": "00000000-0000-4000-8000-000000000025",
          "carreraId": "00000000-0000-4000-8000-000000000011",
          "universidad": "Universidad EAFIT",
          "carrera": "Ingenieria de Sistemas",
          "imagenUrl": "/campus/eafit.webp",
          "ciudad": "Medellin",
          "costo": 18000000,
          "modalidad": "virtual",
          "jornada": "mixta",
          "duracion": 9,
          "acreditacion": false,
          "snies": "1005"
        },
        "puntaje": 57,
        "desglose": { "costo": 0.28, "modalidad": 1, "ubicacion": 1, "acreditacion": 0 }
      }
    ]
  }
}
```

El `id` de la busqueda es un ejemplo: cada ejecucion genera uno nuevo.

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `carrera` faltante o vacio, valor de `modalidad` o `jornada` fuera de la lista, `costoMax` negativo, `pesos` incompletos o campos no declarados |
| 404 | `Usuario con ID <usuarioId> no existe` |

**Ejemplo**

```bash
curl -X POST http://localhost:3000/busquedas \
  -H "Content-Type: application/json" \
  -d '{"carrera":"Ingenieria de Sistemas","costoMax":25000000}'
```

### GET /busquedas/{id}

Devuelve el resumen de una busqueda: los filtros usados (sin `usuarioId`), el total de resultados y la fecha.

**Respuesta 200**

```json
{
  "id": "5b0e7d1c-8a42-4f9e-b6d3-1e2f9a7c4d80",
  "filtros": { "carrera": "Ingenieria de Sistemas", "costoMax": 25000000 },
  "total": 3,
  "fecha": "2026-11-05T15:04:12.318Z"
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | `Busqueda con ID <id> no existe` |

**Ejemplo**

```bash
curl http://localhost:3000/busquedas/<id-busqueda>
```

### GET /busquedas/{id}/resultados

Devuelve el arreglo `resultados` guardado al crear la busqueda. Tiene el mismo formato que `data.resultados` de `POST /busquedas`.

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | `Busqueda con ID <id> no existe` |

**Ejemplo**

```bash
curl http://localhost:3000/busquedas/<id-busqueda>/resultados
```

---

## Comparaciones

### POST /comparaciones

Compara de 2 a 4 ofertas y guarda la tabla comparativa.

**Body** (`ComparacionRequestDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `ofertaIds` | string[] | Requerido. Entre 2 y 4 elementos, sin repetidos, cada uno UUID version 4 |

**Calculo**

- `costoTotal` = `costo` x `duracion` de la oferta.
- `puntaje` = 50 si la oferta esta acreditada, mas 50 x (1 - `costoTotal` / `costoTotal` maximo de la comparacion), redondeado.
- La tabla sale ordenada de mayor a menor `puntaje`. `mejorOfertaId` es la primera fila.

**Respuesta 201**

```json
{
  "message": "Comparacion creada correctamente",
  "data": {
    "id": "a3f1c9e2-6d7b-4b58-8e10-9c2d4f6a7b31",
    "tabla": [
      {
        "ofertaId": "00000000-0000-4000-8000-000000000101",
        "universidad": "Universidad Nacional de Colombia",
        "costoTotal": 45000000,
        "duracion": 10,
        "modalidad": "presencial",
        "acreditacion": true,
        "puntaje": 86
      },
      {
        "ofertaId": "00000000-0000-4000-8000-000000000105",
        "universidad": "Universidad EAFIT",
        "costoTotal": 162000000,
        "duracion": 9,
        "modalidad": "virtual",
        "acreditacion": false,
        "puntaje": 0
      }
    ],
    "mejorOfertaId": "00000000-0000-4000-8000-000000000101"
  }
}
```

El `id` de la comparacion es un ejemplo.

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | Menos de 2 o mas de 4 ofertas, ofertas repetidas, ID que no es UUID v4 o campo faltante |
| 404 | `Oferta con ID <id> no existe` |

**Ejemplo**

```bash
curl -X POST http://localhost:3000/comparaciones \
  -H "Content-Type: application/json" \
  -d '{"ofertaIds":["00000000-0000-4000-8000-000000000101","00000000-0000-4000-8000-000000000105"]}'
```

### GET /comparaciones/{id}

Devuelve la comparacion directamente (sin `message` ni `data`). Si la oferta marcada como mejor fue eliminada, `mejorOfertaId` sale como cadena vacia.

**Respuesta 200**

```json
{
  "id": "a3f1c9e2-6d7b-4b58-8e10-9c2d4f6a7b31",
  "tabla": [
    { "ofertaId": "00000000-0000-4000-8000-000000000101", "universidad": "Universidad Nacional de Colombia", "costoTotal": 45000000, "duracion": 10, "modalidad": "presencial", "acreditacion": true, "puntaje": 86 },
    ...
  ],
  "mejorOfertaId": "00000000-0000-4000-8000-000000000101"
}
```

La `tabla` tiene las mismas filas que en el POST (aqui se abrevia con `...`).

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | `Comparacion con ID <id> no existe` |

**Ejemplo**

```bash
curl http://localhost:3000/comparaciones/<id-comparacion>
```

### DELETE /comparaciones/{id}

Elimina la comparacion.

**Respuesta 200**

```json
{ "message": "Comparacion eliminada correctamente" }
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | `Comparacion con ID <id> no existe` |

**Ejemplo**

```bash
curl -X DELETE http://localhost:3000/comparaciones/<id-comparacion>
```

---

## Catalogo

Las lecturas (`GET`) son publicas, devuelven los datos directamente (sin `message` ni `data`) y no hay paginacion. Las escrituras (`POST`, `PUT`, `DELETE`) exigen `Authorization: Bearer <accessToken>` de un usuario con rol `admin` (401 sin token, 403 para un estudiante) y devuelven `{ "message", "data" }`.

### GET /carreras

Lista las carreras ordenadas por nombre.

**Query**

| Parametro | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Opcional, no vacio. Devuelve las carreras cuyo nombre **contiene** el texto, sin distinguir mayusculas |

**Respuesta 200** (`?nombre=ing`)

```json
[
  { "id": "00000000-0000-4000-8000-000000000011", "nombre": "Ingenieria de Sistemas" }
]
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `?nombre=` vacio o parametro no declarado (por ejemplo `?foo=1`) |

**Ejemplo**

```bash
curl "http://localhost:3000/carreras?nombre=ing"
```

### GET /carreras/{id}

**Respuesta 200**

```json
{ "id": "00000000-0000-4000-8000-000000000012", "nombre": "Derecho" }
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | `Carrera con ID <id> no existe` |

**Ejemplo**

```bash
curl http://localhost:3000/carreras/00000000-0000-4000-8000-000000000012
```

### GET /universidades

Lista las universidades ordenadas por nombre.

**Query**

| Parametro | Tipo | Reglas |
|---|---|---|
| `ciudad` | string | Opcional, no vacio. Coincidencia **exacta** sin distinguir mayusculas. Los nombres de ciudad del catalogo no llevan tilde (`Bogota`, `Medellin`) |

**Respuesta 200** (`?ciudad=Medellin`)

```json
[
  { "id": "00000000-0000-4000-8000-000000000024", "nombre": "Universidad de Antioquia", "ciudad": "Medellin", "imagenUrl": "/campus/antioquia.webp" },
  { "id": "00000000-0000-4000-8000-000000000025", "nombre": "Universidad EAFIT", "ciudad": "Medellin", "imagenUrl": "/campus/eafit.webp" }
]
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `?ciudad=` vacio o parametro no declarado |

**Ejemplo**

```bash
curl "http://localhost:3000/universidades?ciudad=Medellin"
```

### GET /universidades/{id}

**Respuesta 200**

```json
{
  "id": "00000000-0000-4000-8000-000000000021",
  "nombre": "Universidad Nacional de Colombia",
  "ciudad": "Bogota",
  "imagenUrl": "/campus/nacional.webp",
  "ofertas": [
    {
      "id": "00000000-0000-4000-8000-000000000101",
      "universidadId": "00000000-0000-4000-8000-000000000021",
      "carreraId": "00000000-0000-4000-8000-000000000011",
      "universidad": "Universidad Nacional de Colombia",
      "carrera": "Ingenieria de Sistemas",
      "imagenUrl": "/campus/nacional.webp",
      "ciudad": "Bogota",
      "costo": 4500000,
      "modalidad": "presencial",
      "jornada": "diurna",
      "duracion": 10,
      "acreditacion": true,
      "snies": "1001"
    }
  ]
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | `Universidad con ID <id> no existe` |

**Ejemplo**

```bash
curl http://localhost:3000/universidades/00000000-0000-4000-8000-000000000021
```

### GET /ofertas/{id}

**Respuesta 200**

```json
{
  "id": "00000000-0000-4000-8000-000000000105",
  "universidadId": "00000000-0000-4000-8000-000000000025",
  "carreraId": "00000000-0000-4000-8000-000000000011",
  "universidad": "Universidad EAFIT",
  "carrera": "Ingenieria de Sistemas",
  "imagenUrl": "/campus/eafit.webp",
  "ciudad": "Medellin",
  "costo": 18000000,
  "modalidad": "virtual",
  "jornada": "mixta",
  "duracion": 9,
  "acreditacion": false,
  "snies": "1005"
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `id` no es UUID |
| 404 | `Oferta con ID <id> no existe` |

**Ejemplo**

```bash
curl http://localhost:3000/ofertas/00000000-0000-4000-8000-000000000105
```

### GET /ofertas

Lista las ofertas ordenadas por SNIES. Devuelve un arreglo de objetos con la misma forma que `GET /ofertas/{id}`.

**Query** (todos opcionales y combinables)

| Parametro | Tipo | Reglas |
|---|---|---|
| `carreraId` | UUID | Solo ofertas de esa carrera |
| `universidadId` | UUID | Solo ofertas de esa universidad |
| `ciudad` | string | Coincidencia exacta sin distinguir mayusculas |

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | UUID invalido, `?ciudad=` vacio o parametro no declarado |

**Ejemplo**

```bash
curl "http://localhost:3000/ofertas?carreraId=00000000-0000-4000-8000-000000000011&ciudad=Bogota"
```

### POST /carreras

**Body**

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Obligatorio, no vacio, maximo 150 caracteres, unico |

**Respuesta 201**

```json
{
  "message": "Carrera creada correctamente",
  "data": { "id": "6f1d2c3e-1a2b-4c5d-8e9f-0a1b2c3d4e5f", "nombre": "Fisica" }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | Body invalido |
| 401 / 403 | Sin token / rol distinto de `admin` |
| 409 | `La carrera <nombre> ya existe` |

**Ejemplo**

```bash
curl -X POST http://localhost:3000/carreras -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"nombre":"Fisica"}'
```

### PUT /carreras/{id}

Body igual al de `POST /carreras`, con todos los campos opcionales (`PartialType`). Responde 200 con `{ "message": "Carrera actualizada correctamente", "data": <carrera> }`.

**Errores**: 400 (`id` no UUID o body invalido), 404 (`Carrera con ID <id> no existe`), 409 (nombre ya existe).

### DELETE /carreras/{id}

Elimina la carrera. Sus ofertas se eliminan en cascada, y desaparecen de favoritos y comparaciones. Responde 200 con `{ "message": "Carrera eliminada correctamente" }`.

**Errores**: 400 (`id` no UUID), 404.

### POST /universidades

**Body**

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Obligatorio, maximo 150 caracteres, unico |
| `ciudad` | string | Obligatorio, maximo 100 caracteres |
| `imagenUrl` | string | Opcional, maximo 255 caracteres (por ejemplo `/campus/andes.webp`) |

**Respuesta 201**

```json
{
  "message": "Universidad creada correctamente",
  "data": {
    "id": "7a2e3d4f-2b3c-4d6e-9f0a-1b2c3d4e5f60",
    "nombre": "Universidad Industrial de Santander",
    "ciudad": "Bucaramanga",
    "imagenUrl": "/campus/uis.webp"
  }
}
```

**Errores**: 400 (body invalido), 409 (`La universidad <nombre> ya existe`).

### PUT /universidades/{id}

Mismo body con todos los campos opcionales. Responde 200 con `{ "message": "Universidad actualizada correctamente", "data": <universidad> }`.

**Errores**: 400, 404 (`Universidad con ID <id> no existe`), 409 (nombre ya existe).

### DELETE /universidades/{id}

Elimina la universidad y, en cascada, sus ofertas (tambien de favoritos y comparaciones). Responde 200 con `{ "message": "Universidad eliminada correctamente" }`.

**Errores**: 400, 404.

### POST /ofertas

**Body**

| Campo | Tipo | Reglas |
|---|---|---|
| `snies` | string | Obligatorio, unico, maximo 50 caracteres |
| `ciudad` | string | Obligatorio, maximo 100 caracteres |
| `costo` | entero | Obligatorio, `>= 0` |
| `modalidad` | string | `presencial`, `virtual` o `hibrida` |
| `jornada` | string | `diurna`, `nocturna` o `mixta` |
| `duracion` | entero | Obligatorio, `>= 1` (semestres) |
| `acreditacion` | boolean | Obligatorio |
| `universidadId` | UUID | Debe existir |
| `carreraId` | UUID | Debe existir |

**Respuesta 201**

```json
{
  "message": "Oferta creada correctamente",
  "data": {
    "id": "8b3f4e5a-3c4d-4e7f-a01b-2c3d4e5f6071",
    "universidadId": "00000000-0000-4000-8000-000000000021",
    "carreraId": "00000000-0000-4000-8000-000000000012",
    "universidad": "Universidad Nacional de Colombia",
    "carrera": "Derecho",
    "imagenUrl": "/campus/nacional.webp",
    "ciudad": "Bogota",
    "costo": 5000000,
    "modalidad": "presencial",
    "jornada": "diurna",
    "duracion": 10,
    "acreditacion": true,
    "snies": "2001"
  }
}
```

**Errores**: 400 (body invalido), 404 (`Universidad con ID <id> no existe` o `Carrera con ID <id> no existe`), 409 (`La oferta con SNIES <snies> ya existe`).

### PUT /ofertas/{id}

Mismo body con todos los campos opcionales; `universidadId` y `carreraId` se validan solo si se envian. Responde 200 con `{ "message": "Oferta actualizada correctamente", "data": <oferta> }`.

**Errores**: 400, 404 (oferta, universidad o carrera), 409 (SNIES repetido).

### DELETE /ofertas/{id}

Elimina la oferta; se quita de favoritos y comparaciones (`mejorOferta` queda en `null`). Responde 200 con `{ "message": "Oferta eliminada correctamente" }`.

**Errores**: 400, 404.
