import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registra un usuario y devuelve tokens', () => {
    const resultado = service.registrar({
      nombre: 'Ana',
      correo: 'ana@correo.com',
      clave: '123456',
    });

    expect(resultado.data.accessToken).toBeDefined();
    expect(resultado.data.refreshToken).toBeDefined();
  });

  it('lanza error con credenciales invalidas', () => {
    expect(() =>
      service.login({ correo: 'nadie@correo.com', clave: 'mala' }),
    ).toThrow(UnauthorizedException);
  });

  it('lanza error si el correo ya esta registrado', () => {
    expect(() =>
      service.registrar({
        nombre: 'Nicolas',
        correo: 'nicolas@correo.com',
        clave: '123456',
      }),
    ).toThrow(ConflictException);
  });
});