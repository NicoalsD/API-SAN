# Referencia de la API

Base URL: `http://localhost:3000` (o el valor de `PORT`). No hay prefijo global: las rutas cuelgan de la raiz (`/carreras`, `/busquedas`, etc.). Los cuerpos son JSON (`Content-Type: application/json`).

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
- **Autenticacion**: ningun endpoint exige token todavia. Los tokens son provisionales (`token-<id>` y `refresh-<id>`), no JWT.

### Endpoints

| Grupo | Metodo | Ruta | Descripcion |
|---|---|---|---|
| Auth | POST | `/auth/registro` | Registra un usuario y devuelve tokens |
| Auth | POST | `/auth/login` | Inicia sesion y devuelve tokens |
| Auth | POST | `/auth/refresh` | Renueva los tokens con un refresh token |
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
| Catalogo | GET | `/universidades` | Lista universidades (filtro `?ciudad=`) |
| Catalogo | GET | `/universidades/{id}` | Consulta una universidad |
| Catalogo | GET | `/ofertas/{id}` | Consulta una oferta academica |

### Datos de ejemplo (seed)

Los ejemplos de este documento usan los datos de `npm run seed`. Usuario demo: `nicolas@correo.com` / `123456`.

| Entidad | Nombre | ID |
|---|---|---|
| Usuario demo | nicolas@correo.com | `00000000-0000-4000-8000-000000000001` |
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
    "accessToken": "token-7c1e9a52-3b8d-4f2e-9a61-2d5c8e4b1f70",
    "refreshToken": "refresh-7c1e9a52-3b8d-4f2e-9a61-2d5c8e4b1f70"
  }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | Campos faltantes, formato invalido o campos no declarados |
| 409 | `El correo <correo> ya esta registrado` |

Nota: la clave se guarda sin hash en esta etapa (BCrypt esta fuera del alcance actual).

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
    "accessToken": "token-00000000-0000-4000-8000-000000000001",
    "refreshToken": "refresh-00000000-0000-4000-8000-000000000001"
  }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | Campos faltantes o formato invalido |
| 401 | `Correo o clave incorrectos` |

**Ejemplo**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"nicolas@correo.com","clave":"123456"}'
```

### POST /auth/refresh

Renueva los tokens. El `refreshToken` debe tener la forma `refresh-<uuid>`: el servicio quita el prefijo `refresh-` y valida que el resto sea un UUID.

**Body** (`RefreshDto`)

| Campo | Tipo | Reglas |
|---|---|---|
| `refreshToken` | string | Requerido, no vacio |

**Respuesta 201**

```json
{
  "message": "Token renovado",
  "data": {
    "accessToken": "token-00000000-0000-4000-8000-000000000001",
    "refreshToken": "refresh-00000000-0000-4000-8000-000000000001"
  }
}
```

**Errores**

| Codigo | Motivo |
|---|---|
| 400 | `refreshToken` faltante o vacio |
| 401 | `Refresh token invalido` (formato incorrecto o usuario inexistente) |

**Ejemplo**

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"refresh-00000000-0000-4000-8000-000000000001"}'
```

---

## Usuarios

Todos los endpoints de este grupo reciben `:id` (UUID del usuario). Si el usuario no existe, responden 404 con `Usuario con ID <id> no existe`.

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
          "universidad": "Universidad Nacional de Colombia",
          "carrera": "Ingenieria de Sistemas",
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
          "universidad": "Universidad de los Andes",
          "carrera": "Ingenieria de Sistemas",
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
          "universidad": "Universidad EAFIT",
          "carrera": "Ingenieria de Sistemas",
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

Estos endpoints son de solo lectura. Devuelven los datos directamente (sin `message` ni `data`). No hay paginacion.

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
  { "id": "00000000-0000-4000-8000-000000000024", "nombre": "Universidad de Antioquia", "ciudad": "Medellin" },
  { "id": "00000000-0000-4000-8000-000000000025", "nombre": "Universidad EAFIT", "ciudad": "Medellin" }
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
{ "id": "00000000-0000-4000-8000-000000000021", "nombre": "Universidad Nacional de Colombia", "ciudad": "Bogota" }
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
  "universidad": "Universidad EAFIT",
  "carrera": "Ingenieria de Sistemas",
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
