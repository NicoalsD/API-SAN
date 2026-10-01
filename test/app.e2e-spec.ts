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

  afterEach(async () => {
    await app.close();
  });
});