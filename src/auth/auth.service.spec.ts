import { jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IDS_SEMILLA } from '../common/semilla';
import { Usuario } from '../usuarios/usuario.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepository: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const usuario = {
    id: IDS_SEMILLA.usuario,
    nombre: 'Nicolas',
    correo: 'nicolas@correo.com',
    clave: '123456',
    preferencias: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
    favoritos: [],
    fechaRegistro: new Date(),
  } as Usuario;

  beforeEach(async () => {
    usuarioRepository = {
      findOneBy: jest.fn(),
      create: jest.fn((datos: Partial<Usuario>) => datos),
      save: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registra un usuario y devuelve tokens', async () => {
    usuarioRepository.findOneBy.mockResolvedValue(null);
    usuarioRepository.save.mockResolvedValue({
      ...usuario,
      id: 'nuevo-usuario',
      correo: 'ana@correo.com',
    });

    const resultado = await service.registrar({
      nombre: 'Ana',
      correo: 'ana@correo.com',
      clave: '123456',
    });

    expect(resultado.data.accessToken).toBeDefined();
    expect(resultado.data.refreshToken).toBeDefined();
  });

  it('lanza error con credenciales invalidas', async () => {
    usuarioRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.login({ correo: 'nadie@correo.com', clave: 'mala' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza error si el correo ya esta registrado', async () => {
    usuarioRepository.findOneBy.mockResolvedValue(usuario);

    await expect(
      service.registrar({
        nombre: 'Nicolas',
        correo: 'nicolas@correo.com',
        clave: '123456',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rechaza un refresh token invalido', async () => {
    await expect(service.refresh('refresh-basura')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
