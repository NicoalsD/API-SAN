import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { sembrarBd } from './../src/common/semilla';

describe('Busquedas (e2e)', () => {
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

  it('POST /busquedas con carrera valida devuelve resultados con desglose', () => {
    return request(app.getHttpServer())
      .post('/busquedas')
      .send({ carrera: 'Ingenieria de Sistemas' })
      .expect(201)
      .expect((respuesta) => {
        const { resultados, total } = respuesta.body.data;
        expect(resultados.length).toBeGreaterThan(0);
        expect(total).toBe(resultados.length);
        resultados.forEach(
          (resultado: {
            puntaje: number;
            desglose: Record<string, number>;
          }) => {
            expect(resultado.desglose).toEqual(
              expect.objectContaining({
                costo: expect.any(Number),
                modalidad: expect.any(Number),
                ubicacion: expect.any(Number),
                acreditacion: expect.any(Number),
              }),
            );
            expect(resultado.puntaje).toBeGreaterThanOrEqual(0);
            expect(resultado.puntaje).toBeLessThanOrEqual(100);
          },
        );
      });
  });

  it('POST /busquedas con usuarioId inexistente responde 404', () => {
    return request(app.getHttpServer())
      .post('/busquedas')
      .send({
        carrera: 'Ingenieria de Sistemas',
        usuarioId: randomUUID(),
      })
      .expect(404);
  });

  it('POST /busquedas con modalidad invalida responde 400', () => {
    return request(app.getHttpServer())
      .post('/busquedas')
      .send({ carrera: 'Ingenieria de Sistemas', modalidad: 'marciana' })
      .expect(400);
  });

  it('GET /busquedas/:id/resultados devuelve el arreglo de resultados', async () => {
    const creada = await request(app.getHttpServer())
      .post('/busquedas')
      .send({ carrera: 'Ingenieria de Sistemas' })
      .expect(201);
    const id = creada.body.data.id;

    return request(app.getHttpServer())
      .get(`/busquedas/${id}/resultados`)
      .expect(200)
      .expect((respuesta) => {
        expect(Array.isArray(respuesta.body)).toBe(true);
        expect(respuesta.body).toHaveLength(creada.body.data.total);
        expect(respuesta.body[0]).toEqual(
          expect.objectContaining({
            puntaje: expect.any(Number),
            desglose: expect.any(Object),
          }),
        );
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
