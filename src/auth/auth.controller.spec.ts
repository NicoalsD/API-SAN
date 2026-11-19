import { jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let servicio: {
    registrar: jest.Mock;
    correoDisponible: jest.Mock;
    login: jest.Mock;
    refresh: jest.Mock;
  };

  const respuesta = { message: 'ok', data: {} };

  beforeEach(() => {
    servicio = {
      registrar: jest.fn(async () => respuesta),
      correoDisponible: jest.fn(async () => ({
        message: 'ok',
        data: { disponible: true },
      })),
      login: jest.fn(async () => respuesta),
      refresh: jest.fn(async () => respuesta),
    };
    controller = new AuthController(servicio as unknown as AuthService);
  });

  it('POST /auth/registro delega en registrar', async () => {
    const datos = {
      nombre: 'Ana',
      apellido: 'Perez',
      correo: 'ana@correo.com',
      clave: '12345678',
      ciudad: 'Bogota',
    };

    await controller.registrar(datos as never);
    expect(servicio.registrar).toHaveBeenCalledWith(datos);
  });

  it('POST /auth/correo-disponible pasa solo el correo', async () => {
    const resultado = await controller.correoDisponible({
      correo: 'ana@correo.com',
    });

    expect(servicio.correoDisponible).toHaveBeenCalledWith('ana@correo.com');
    expect(resultado).toEqual({ message: 'ok', data: { disponible: true } });
  });

  it('POST /auth/login delega en login', async () => {
    const datos = { correo: 'ana@correo.com', clave: '12345678' };

    await controller.login(datos);
    expect(servicio.login).toHaveBeenCalledWith(datos);
  });

  it('POST /auth/refresh pasa solo el refresh token', async () => {
    await controller.refresh({ refreshToken: 'token' });
    expect(servicio.refresh).toHaveBeenCalledWith('token');
  });
});
