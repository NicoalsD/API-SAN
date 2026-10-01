import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API SAN (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('POST /auth/registro registra un usuario', () => {
    return request(app.getHttpServer())
      .post('/auth/registro')
      .send({ nombre: 'Ana', correo: 'ana@correo.com', clave: '123456' })
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

  it('POST /comparaciones devuelve la tabla comparativa', () => {
    return request(app.getHttpServer())
      .post('/comparaciones')
      .send({ ofertaIds: ['1', '5'] })
      .expect(201)
      .expect((respuesta) => {
        expect(respuesta.body.data.tabla).toHaveLength(2);
        expect(respuesta.body.data.mejorOfertaId).toBeDefined();
      });
  });

  afterEach(async () => {
    await app.close();
  });
});