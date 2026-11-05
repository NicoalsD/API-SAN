import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { sembrarBd } from './../src/common/semilla';
import { Perfil } from './../src/usuarios/perfil.entity';
import { Usuario } from './../src/usuarios/usuario.entity';

describe('Usuarios (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

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
    dataSource = app.get(DataSource);
    await sembrarBd(dataSource);
  });

  async function registrar() {
    const correo = `perfil-${randomUUID()}@correo.com`;
    await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nombre: 'Ana',
        correo,
        clave: '12345678',
        perfil: { apellido: 'Gomez', ciudad: 'Bogota' },
      })
      .expect(201);

    return dataSource
      .getRepository(Usuario)
      .findOneOrFail({ where: { correo }, relations: { perfil: true } });
  }

  it('GET /usuarios/:id devuelve el usuario con perfil y sin clave', async () => {
    const usuario = await registrar();

    const respuesta = await request(app.getHttpServer())
      .get(`/usuarios/${usuario.id}`)
      .expect(200);

    expect(respuesta.body.data.perfil).toEqual(
      expect.objectContaining({ apellido: 'Gomez', ciudad: 'Bogota' }),
    );
    expect(respuesta.body.data).not.toHaveProperty('clave');
  });

  it('PUT /usuarios/:id actualiza el perfil existente sin crear otro', async () => {
    const usuario = await registrar();
    const perfilId = usuario.perfil?.id;

    const respuesta = await request(app.getHttpServer())
      .put(`/usuarios/${usuario.id}`)
      .send({ nombre: 'Ana Maria', perfil: { ciudad: 'Medellin' } })
      .expect(200);

    expect(respuesta.body.data.nombre).toBe('Ana Maria');
    expect(respuesta.body.data.perfil).toEqual(
      expect.objectContaining({
        id: perfilId,
        apellido: 'Gomez',
        ciudad: 'Medellin',
      }),
    );
    const perfil = await dataSource
      .getRepository(Perfil)
      .findOneByOrFail({ id: perfilId });
    expect(perfil.ciudad).toBe('Medellin');
  });

  it('PUT /usuarios/:id responde 409 con un correo ya registrado', async () => {
    const usuario = await registrar();
    const otro = await registrar();

    return request(app.getHttpServer())
      .put(`/usuarios/${usuario.id}`)
      .send({ correo: otro.correo })
      .expect(409);
  });

  it('PUT /usuarios/:id responde 400 con campos invalidos', async () => {
    const usuario = await registrar();

    return request(app.getHttpServer())
      .put(`/usuarios/${usuario.id}`)
      .send({ perfil: { avatar: 'no-es-url' } })
      .expect(400);
  });

  it('GET /usuarios/:id responde 404 si no existe', () => {
    return request(app.getHttpServer())
      .get(`/usuarios/${randomUUID()}`)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
