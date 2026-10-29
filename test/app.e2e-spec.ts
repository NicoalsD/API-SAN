import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { IDS_SEMILLA, sembrarBd } from './../src/common/semilla';

describe('API SAN (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await sembrarBd(app.get(DataSource));
  });

  it('POST /auth/registro registra un usuario', () => {
    return request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nombre: 'Ana',
        correo: `ana-${randomUUID()}@correo.com`,
        clave: '123456',
      })
      .expect(201)
      .expect((respuesta) => {
        expect(respuesta.body.data.accessToken).toBeDefined();
      });
  });

  it('POST /auth/login rechaza credenciales invalidas', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: 'nadie@correo.com', clave: 'mala' })
      .expect(401);
  });

  it('POST /auth/refresh rechaza un token invalido', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'basura' })
      .expect(401);
  });

  it('POST /auth/registro rechaza correo duplicado', async () => {
    const datos = {
      nombre: 'Ana',
      correo: `ana-${randomUUID()}@correo.com`,
      clave: '123456',
    };
    await request(app.getHttpServer())
      .post('/auth/registro')
      .send(datos)
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth/registro')
      .send(datos)
      .expect(409);
  });

  it('POST /busquedas devuelve resultados ordenados por puntaje', () => {
    return request(app.getHttpServer())
      .post('/busquedas')
      .send({ carrera: 'Ingenieria de Sistemas', costoMax: 25000000 })
      .expect(201)
      .expect((respuesta) => {
        const resultados = respuesta.body.data.resultados;
        expect(resultados.length).toBeGreaterThan(0);
        expect(resultados[0].puntaje).toBeGreaterThanOrEqual(
          resultados[resultados.length - 1].puntaje,
        );
      });
  });

  it('GET /carreras lista el catalogo', () => {
    return request(app.getHttpServer())
      .get('/carreras')
      .expect(200)
      .expect((respuesta) => {
        expect(respuesta.body.length).toBeGreaterThan(0);
      });
  });

  it('GET /carreras/:id rechaza un UUID invalido', () => {
    return request(app.getHttpServer()).get('/carreras/999').expect(400);
  });

  it('GET /ofertas/:id devuelve universidad y carrera planas', () => {
    return request(app.getHttpServer())
      .get(`/ofertas/${IDS_SEMILLA.ofertas.nacionalSistemas}`)
      .expect(200)
      .expect((respuesta) => {
        expect(respuesta.body.universidad).toBe(
          'Universidad Nacional de Colombia',
        );
        expect(respuesta.body.carrera).toBe('Ingenieria de Sistemas');
      });
  });

  it('POST /comparaciones devuelve la tabla comparativa', () => {
    return request(app.getHttpServer())
      .post('/comparaciones')
      .send({
        ofertaIds: [
          IDS_SEMILLA.ofertas.nacionalSistemas,
          IDS_SEMILLA.ofertas.eafitSistemas,
        ],
      })
      .expect(201)
      .expect((respuesta) => {
        expect(respuesta.body.data.tabla).toHaveLength(2);
        expect(respuesta.body.data.mejorOfertaId).toBeDefined();
      });
  });

  it('persiste las preferencias del usuario', async () => {
    const correo = `preferencias-${randomUUID()}@correo.com`;
    const registro = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({ nombre: 'Ana', correo, clave: '123456' })
      .expect(201);
    const usuarioId = registro.body.data.accessToken.replace('token-', '');

    await request(app.getHttpServer())
      .put(`/usuarios/${usuarioId}/preferencias`)
      .send({ costo: 5, modalidad: 4, ubicacion: 3, acreditacion: 2 })
      .expect(200)
      .expect((respuesta) => {
        expect(respuesta.body.data.costo).toBe(5);
      });

    await request(app.getHttpServer())
      .get(`/usuarios/${usuarioId}/preferencias`)
      .expect(200)
      .expect((respuesta) => {
        expect(respuesta.body.costo).toBe(5);
      });
  });

  it('persiste los favoritos del usuario', async () => {
    const correo = `favoritos-${randomUUID()}@correo.com`;
    const registro = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({ nombre: 'Ana', correo, clave: '123456' })
      .expect(201);
    const usuarioId = registro.body.data.accessToken.replace('token-', '');

    await request(app.getHttpServer())
      .post(`/usuarios/${usuarioId}/favoritos`)
      .send({ ofertaId: IDS_SEMILLA.ofertas.eafitSistemas })
      .expect(201)
      .expect((respuesta) => {
        expect(respuesta.body.data).toContain(
          IDS_SEMILLA.ofertas.eafitSistemas,
        );
      });

    await request(app.getHttpServer())
      .get(`/usuarios/${usuarioId}/favoritos`)
      .expect(200)
      .expect((respuesta) => {
        expect(respuesta.body).toContain(IDS_SEMILLA.ofertas.eafitSistemas);
      });

    await request(app.getHttpServer())
      .delete(
        `/usuarios/${usuarioId}/favoritos/${IDS_SEMILLA.ofertas.eafitSistemas}`,
      )
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
