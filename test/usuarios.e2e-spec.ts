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
    const registro = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nombre: 'Ana',
        correo,
        clave: '12345678',
        perfil: { apellido: 'Gomez', ciudad: 'Bogota' },
      })
      .expect(201);

    const usuario = await dataSource
      .getRepository(Usuario)
      .findOneOrFail({ where: { correo }, relations: { perfil: true } });
    expect(usuario.id).toBe(registro.body.data.usuario.id);
    expect(usuario.clave).not.toBe('12345678');

    return {
      ...usuario,
      token: `Bearer ${registro.body.data.accessToken}`,
    };
  }

  async function iniciarSesion(correo: string, clave: string) {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo, clave })
      .expect(201);
    return `Bearer ${respuesta.body.data.accessToken}`;
  }

  it('GET /usuarios/:id devuelve el usuario con perfil y sin clave', async () => {
    const usuario = await registrar();

    const respuesta = await request(app.getHttpServer())
      .get(`/usuarios/${usuario.id}`)
      .set('Authorization', usuario.token)
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
      .set('Authorization', usuario.token)
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
      .set('Authorization', usuario.token)
      .send({ correo: otro.correo })
      .expect(409);
  });

  it('PUT /usuarios/:id responde 400 con campos invalidos', async () => {
    const usuario = await registrar();

    return request(app.getHttpServer())
      .put(`/usuarios/${usuario.id}`)
      .set('Authorization', usuario.token)
      .send({ perfil: { avatar: 'no-es-url' } })
      .expect(400);
  });

  it('GET /usuarios/:id responde 404 si no existe (admin)', async () => {
    const admin = await iniciarSesion('admin@correo.com', 'admin12345');

    await request(app.getHttpServer())
      .get(`/usuarios/${randomUUID()}`)
      .set('Authorization', admin)
      .expect(404);
  });

  it('responde 401 sin token o con token invalido', async () => {
    const usuario = await registrar();

    await request(app.getHttpServer())
      .get(`/usuarios/${usuario.id}`)
      .expect(401);
    await request(app.getHttpServer())
      .put(`/usuarios/${usuario.id}`)
      .send({ nombre: 'Otro' })
      .expect(401);
    await request(app.getHttpServer())
      .get(`/usuarios/${usuario.id}/favoritos`)
      .set('Authorization', 'Bearer token-malo')
      .expect(401);
  });

  it('responde 403 al acceder a otro usuario, 200 para un admin', async () => {
    const usuario = await registrar();
    const otro = await registrar();

    await request(app.getHttpServer())
      .get(`/usuarios/${otro.id}`)
      .set('Authorization', usuario.token)
      .expect(403);
    await request(app.getHttpServer())
      .put(`/usuarios/${otro.id}`)
      .set('Authorization', usuario.token)
      .send({ nombre: 'Intruso' })
      .expect(403);
    await request(app.getHttpServer())
      .get(`/usuarios/${otro.id}/favoritos`)
      .set('Authorization', usuario.token)
      .expect(403);

    const admin = await iniciarSesion('admin@correo.com', 'admin12345');
    await request(app.getHttpServer())
      .get(`/usuarios/${otro.id}`)
      .set('Authorization', admin)
      .expect(200);
  });

  it('PUT /usuarios/:id hashea la clave nueva y permite iniciar sesion con ella', async () => {
    const usuario = await registrar();

    await request(app.getHttpServer())
      .put(`/usuarios/${usuario.id}`)
      .set('Authorization', usuario.token)
      .send({ clave: 'clave-nueva-123' })
      .expect(200)
      .expect((respuesta) => {
        expect(respuesta.body.data).not.toHaveProperty('clave');
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, clave: 'clave-nueva-123' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, clave: '12345678' })
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
