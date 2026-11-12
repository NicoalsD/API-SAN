import { jest } from '@jest/globals';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PropietarioGuard } from './propietario.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

const contexto = (
  solicitud: object,
  handler: () => void = () => undefined,
  clase: new () => object = class {},
) =>
  ({
    switchToHttp: () => ({ getRequest: () => solicitud }),
    getHandler: () => handler,
    getClass: () => clase,
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let jwtService: { verifyAsync: jest.Mock };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('rechaza una peticion sin Authorization', async () => {
    await expect(guard.canActivate(contexto({ headers: {} }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza un esquema distinto de Bearer', async () => {
    await expect(
      guard.canActivate(contexto({ headers: { authorization: 'Basic abc' } })),
    ).rejects.toThrow('Token de acceso requerido');
  });

  it('rechaza un token invalido o expirado', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('expired'));

    await expect(
      guard.canActivate(
        contexto({ headers: { authorization: 'Bearer malo' } }),
      ),
    ).rejects.toThrow('Token de acceso invalido o expirado');
  });

  it('guarda el payload en request.usuario', async () => {
    const payload = { sub: 'u1', correo: 'a@b.com', rol: 'estudiante' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const solicitud: { headers: object; usuario?: unknown } = {
      headers: { authorization: 'Bearer bueno' },
    };

    expect(await guard.canActivate(contexto(solicitud))).toBe(true);
    expect(solicitud.usuario).toEqual(payload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('bueno');
  });
});

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  class SoloAdmin {
    @Roles('admin')
    accion() {}
  }
  const handlerAdmin = SoloAdmin.prototype.accion;

  class Libre {
    accion() {}
  }

  it('permite si el handler no declara roles', () => {
    expect(guard.canActivate(contexto({}, Libre.prototype.accion, Libre))).toBe(
      true,
    );
  });

  it('permite al rol requerido', () => {
    const solicitud = { usuario: { rol: 'admin' } };

    expect(
      guard.canActivate(contexto(solicitud, handlerAdmin, SoloAdmin)),
    ).toBe(true);
  });

  it('responde 403 a otro rol', () => {
    const solicitud = { usuario: { rol: 'estudiante' } };

    expect(() =>
      guard.canActivate(contexto(solicitud, handlerAdmin, SoloAdmin)),
    ).toThrow(ForbiddenException);
  });

  it('responde 403 si no hay usuario autenticado', () => {
    expect(() =>
      guard.canActivate(contexto({}, handlerAdmin, SoloAdmin)),
    ).toThrow('No tienes permisos para esta accion');
  });
});

describe('PropietarioGuard', () => {
  const guard = new PropietarioGuard();

  it('permite al propio usuario', () => {
    const solicitud = {
      usuario: { sub: 'u1', rol: 'estudiante' },
      params: { id: 'u1' },
    };

    expect(guard.canActivate(contexto(solicitud))).toBe(true);
  });

  it('responde 403 a un estudiante sobre otro usuario', () => {
    const solicitud = {
      usuario: { sub: 'u1', rol: 'estudiante' },
      params: { id: 'u2' },
    };

    expect(() => guard.canActivate(contexto(solicitud))).toThrow(
      ForbiddenException,
    );
  });

  it('permite a un admin sobre cualquier usuario', () => {
    const solicitud = {
      usuario: { sub: 'admin', rol: 'admin' },
      params: { id: 'u2' },
    };

    expect(guard.canActivate(contexto(solicitud))).toBe(true);
  });
});
