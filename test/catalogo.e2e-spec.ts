import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { IDS_SEMILLA, sembrarBd } from './../src/common/semilla';

describe('Catalogo (e2e)', () => {
  let app: INestApplication<App>;
  let tokenAdmin: string;
  let tokenEstudiante: string;

  async function iniciarSesion(correo: string, clave: string) {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo, clave })
      .expect(201);
    return respuesta.body.data.accessToken as string;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    await sembrarBd(app.get(DataSource));
    tokenAdmin = await iniciarSesion('admin@correo.com', 'admin12345');
    tokenEstudiante = await iniciarSesion('nicolas@correo.com', '12345678');
  });

  it('GET /carreras?nombre=sis encuentra Ingenieria de Sistemas', () => {
    return request(app.getHttpServer())
      .get('/carreras?nombre=sis')
      .expect(200)
      .expect((respuesta) => {
        const nombres = respuesta.body.map(
          (carrera: { nombre: string }) => carrera.nombre,
        );
        expect(nombres).toContain('Ingenieria de Sistemas');
      });
  });

  it('GET /universidades?ciudad=bogota devuelve solo universidades de Bogota', () => {
    return request(app.getHttpServer())
      .get('/universidades?ciudad=bogota')
      .expect(200)
      .expect((respuesta) => {
        const universidades = respuesta.body as {
          id: string;
          ciudad: string;
        }[];
        expect(universidades.length).toBeGreaterThan(0);
        universidades.forEach((universidad) => {
          expect(universidad.ciudad).toBe('Bogota');
        });
        const ids = universidades.map((universidad) => universidad.id);
        expect(ids).toContain(IDS_SEMILLA.universidades.nacional);
      });
  });

  it('GET /universidades/:id incluye el arreglo ofertas', () => {
    return request(app.getHttpServer())
      .get(`/universidades/${IDS_SEMILLA.universidades.nacional}`)
      .expect(200)
      .expect((respuesta) => {
        expect(respuesta.body.nombre).toBe('Universidad Nacional de Colombia');
        expect(Array.isArray(respuesta.body.ofertas)).toBe(true);
        expect(respuesta.body.ofertas.length).toBeGreaterThan(0);
        expect(respuesta.body.ofertas[0].universidad).toBe(
          'Universidad Nacional de Colombia',
        );
      });
  });

  it('GET /carreras/no-uuid responde 400', () => {
    return request(app.getHttpServer()).get('/carreras/no-uuid').expect(400);
  });

  it('GET /ofertas/<uuid inexistente> responde 404', () => {
    return request(app.getHttpServer())
      .get('/ofertas/00000000-0000-4000-8000-999999999999')
      .expect(404);
  });

  it('GET /universidades incluye imagenUrl y GET /ofertas la expone', async () => {
    const universidades = await request(app.getHttpServer())
      .get(`/universidades/${IDS_SEMILLA.universidades.nacional}`)
      .expect(200);
    expect(universidades.body.imagenUrl).toBe('/campus/nacional.webp');

    const ofertas = await request(app.getHttpServer())
      .get(`/ofertas/${IDS_SEMILLA.ofertas.nacionalSistemas}`)
      .expect(200);
    expect(ofertas.body).toEqual(
      expect.objectContaining({
        universidadId: IDS_SEMILLA.universidades.nacional,
        carreraId: IDS_SEMILLA.carreras.sistemas,
        imagenUrl: '/campus/nacional.webp',
      }),
    );
  });

  it('GET /ofertas filtra por carrera, universidad y ciudad', async () => {
    const porCarrera = await request(app.getHttpServer())
      .get(`/ofertas?carreraId=${IDS_SEMILLA.carreras.sistemas}`)
      .expect(200);
    expect(porCarrera.body.length).toBeGreaterThan(1);
    porCarrera.body.forEach((oferta: { carreraId: string }) =>
      expect(oferta.carreraId).toBe(IDS_SEMILLA.carreras.sistemas),
    );

    const combinado = await request(app.getHttpServer())
      .get(
        `/ofertas?universidadId=${IDS_SEMILLA.universidades.valle}&ciudad=cali`,
      )
      .expect(200);
    expect(combinado.body).toHaveLength(2);

    await request(app.getHttpServer()).get('/ofertas?carreraId=x').expect(400);
  });

  describe('CRUD', () => {
    const http = (token = tokenAdmin) => {
      const servidor = request(app.getHttpServer());
      return {
        get: (ruta: string) =>
          servidor.get(ruta).set('Authorization', `Bearer ${token}`),
        post: (ruta: string) =>
          servidor.post(ruta).set('Authorization', `Bearer ${token}`),
        put: (ruta: string) =>
          servidor.put(ruta).set('Authorization', `Bearer ${token}`),
        delete: (ruta: string) =>
          servidor.delete(ruta).set('Authorization', `Bearer ${token}`),
      };
    };
    const unico = () => randomUUID().slice(0, 8);

    async function crearCarrera() {
      const respuesta = await http()
        .post('/carreras')
        .send({ nombre: `Carrera ${unico()}` })
        .expect(201);
      return respuesta.body.data as { id: string; nombre: string };
    }

    async function crearUniversidad() {
      const respuesta = await http()
        .post('/universidades')
        .send({ nombre: `Universidad ${unico()}`, ciudad: 'Pasto' })
        .expect(201);
      return respuesta.body.data as { id: string; imagenUrl: string | null };
    }

    async function crearOferta(universidadId: string, carreraId: string) {
      const respuesta = await http()
        .post('/ofertas')
        .send({
          snies: `T-${unico()}`,
          ciudad: 'Pasto',
          costo: 1000000,
          modalidad: 'virtual',
          jornada: 'mixta',
          duracion: 8,
          acreditacion: false,
          universidadId,
          carreraId,
        })
        .expect(201);
      return respuesta.body.data as { id: string; snies: string };
    }

    async function registrarUsuario() {
      const respuesta = await http()
        .post('/auth/registro')
        .send({
          nombre: 'Ana',
          correo: `crud-${randomUUID()}@correo.com`,
          clave: '12345678',
          perfil: { apellido: 'Gomez', ciudad: 'Bogota' },
        })
        .expect(201);
      return {
        id: respuesta.body.data.usuario.id as string,
        token: respuesta.body.data.accessToken as string,
      };
    }

    it('responde 401 sin token y 403 a un estudiante en el CRUD', async () => {
      const servidor = request(app.getHttpServer());
      const idInexistente = randomUUID();
      const cuerpo = { nombre: `Sin permiso ${unico()}` };

      await servidor.post('/carreras').send(cuerpo).expect(401);
      await servidor.put(`/carreras/${idInexistente}`).send(cuerpo).expect(401);
      await servidor.delete(`/ofertas/${idInexistente}`).expect(401);
      await servidor
        .post('/universidades')
        .set('Authorization', 'Bearer token-malo')
        .send(cuerpo)
        .expect(401);

      await http(tokenEstudiante).post('/carreras').send(cuerpo).expect(403);
      await http(tokenEstudiante)
        .put(`/universidades/${idInexistente}`)
        .send(cuerpo)
        .expect(403);
      await http(tokenEstudiante)
        .delete(`/ofertas/${idInexistente}`)
        .expect(403);
      await servidor.get('/carreras').expect(200);
    });

    it('crea, actualiza y elimina una carrera', async () => {
      const carrera = await crearCarrera();
      await http()
        .post('/carreras')
        .send({ nombre: carrera.nombre })
        .expect(409);

      const nuevoNombre = `Renombrada ${unico()}`;
      await http()
        .put(`/carreras/${carrera.id}`)
        .send({ nombre: nuevoNombre })
        .expect(200)
        .expect((respuesta) => {
          expect(respuesta.body.data.nombre).toBe(nuevoNombre);
        });

      await http().delete(`/carreras/${carrera.id}`).expect(200);
      await http().get(`/carreras/${carrera.id}`).expect(404);
      await http().delete(`/carreras/${carrera.id}`).expect(404);
    });

    it('crea y actualiza una universidad con imagenUrl', async () => {
      const universidad = await crearUniversidad();
      expect(universidad.imagenUrl).toBeNull();

      await http()
        .put(`/universidades/${universidad.id}`)
        .send({ imagenUrl: '/campus/pasto.webp' })
        .expect(200)
        .expect((respuesta) => {
          expect(respuesta.body.data.imagenUrl).toBe('/campus/pasto.webp');
        });
      await http().delete(`/universidades/${universidad.id}`).expect(200);
    });

    it('crea una oferta por ids y valida las relaciones', async () => {
      const carrera = await crearCarrera();
      const universidad = await crearUniversidad();
      const oferta = await crearOferta(universidad.id, carrera.id);

      await http()
        .get(`/ofertas/${oferta.id}`)
        .expect(200)
        .expect((respuesta) => {
          expect(respuesta.body.universidadId).toBe(universidad.id);
          expect(respuesta.body.carreraId).toBe(carrera.id);
        });

      await http()
        .post('/ofertas')
        .send({
          snies: oferta.snies,
          ciudad: 'Pasto',
          costo: 1,
          modalidad: 'virtual',
          jornada: 'mixta',
          duracion: 8,
          acreditacion: false,
          universidadId: universidad.id,
          carreraId: carrera.id,
        })
        .expect(409);

      await http()
        .post('/ofertas')
        .send({
          snies: `T-${unico()}`,
          ciudad: 'Pasto',
          costo: 1,
          modalidad: 'virtual',
          jornada: 'mixta',
          duracion: 8,
          acreditacion: false,
          universidadId: randomUUID(),
          carreraId: carrera.id,
        })
        .expect(404);

      await http()
        .post('/ofertas')
        .send({ snies: '1', modalidad: 'otra' })
        .expect(400);

      await http()
        .put(`/ofertas/${oferta.id}`)
        .send({ costo: 2000000, carreraId: randomUUID() })
        .expect(404);
      await http()
        .put(`/ofertas/${oferta.id}`)
        .send({ costo: 2000000, acreditacion: true })
        .expect(200)
        .expect((respuesta) => {
          expect(respuesta.body.data.costo).toBe(2000000);
          expect(respuesta.body.data.acreditacion).toBe(true);
          expect(respuesta.body.data.universidadId).toBe(universidad.id);
        });
    });

    it('eliminar una oferta no falla por favoritos ni comparaciones', async () => {
      const carrera = await crearCarrera();
      const universidad = await crearUniversidad();
      const ofertaA = await crearOferta(universidad.id, carrera.id);
      const ofertaB = await crearOferta(universidad.id, carrera.id);
      const usuario = await registrarUsuario();

      await http(usuario.token)
        .post(`/usuarios/${usuario.id}/favoritos`)
        .send({ ofertaId: ofertaA.id })
        .expect(201);
      const comparacion = await http()
        .post('/comparaciones')
        .send({ ofertaIds: [ofertaA.id, ofertaB.id] })
        .expect(201);
      const mejorId = comparacion.body.data.mejorOfertaId as string;

      await http().delete(`/ofertas/${mejorId}`).expect(200);
      const otraId = mejorId === ofertaA.id ? ofertaB.id : ofertaA.id;
      await http().delete(`/ofertas/${otraId}`).expect(200);
      await http(usuario.token)
        .get(`/usuarios/${usuario.id}/favoritos`)
        .expect(200)
        .expect((respuesta) => {
          expect(respuesta.body).not.toContain(ofertaA.id);
        });
      await http()
        .get(`/comparaciones/${comparacion.body.data.id}`)
        .expect(200);
    });

    it('eliminar una universidad o carrera elimina sus ofertas sin fallar', async () => {
      const carrera = await crearCarrera();
      const universidad = await crearUniversidad();
      const oferta = await crearOferta(universidad.id, carrera.id);
      const otra = await crearOferta(universidad.id, carrera.id);
      const usuario = await registrarUsuario();
      await http(usuario.token)
        .post(`/usuarios/${usuario.id}/favoritos`)
        .send({ ofertaId: oferta.id })
        .expect(201);
      await http()
        .post('/comparaciones')
        .send({ ofertaIds: [oferta.id, otra.id] })
        .expect(201);

      await http().delete(`/universidades/${universidad.id}`).expect(200);
      await http().get(`/ofertas/${oferta.id}`).expect(404);

      const carrera2 = await crearCarrera();
      const universidad2 = await crearUniversidad();
      const oferta2 = await crearOferta(universidad2.id, carrera2.id);
      const otra2 = await crearOferta(universidad2.id, carrera2.id);
      await http(usuario.token)
        .post(`/usuarios/${usuario.id}/favoritos`)
        .send({ ofertaId: oferta2.id })
        .expect(201);
      await http()
        .post('/comparaciones')
        .send({ ofertaIds: [oferta2.id, otra2.id] })
        .expect(201);
      await http().delete(`/carreras/${carrera2.id}`).expect(200);
      await http().get(`/ofertas/${oferta2.id}`).expect(404);
      await http().delete(`/universidades/${universidad2.id}`).expect(200);
      await http().delete(`/carreras/${carrera.id}`).expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
