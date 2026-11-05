import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { IDS_SEMILLA, sembrarBd } from './../src/common/semilla';

describe('Catalogo (e2e)', () => {
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

  afterAll(async () => {
    await app.close();
  });
});
