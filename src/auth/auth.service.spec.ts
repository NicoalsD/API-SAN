import { jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IDS_SEMILLA } from '../common/semilla';
import { Usuario } from '../usuarios/usuario.entity';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepository: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let hashClave: string;

  const usuario = {
    id: IDS_SEMILLA.usuario,
    nombre: 'Nicolas',
    correo: 'nicolas@correo.com',
    clave: '',
    rol: 'estudiante',
    preferencias: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
    favoritos: [],
    perfil: null,
    fechaRegistro: new Date(),
    fechaActualizacion: new Date(),
  } as Usuario;

  beforeAll(async () => {
    hashClave = await bcrypt.hash('12345678', 4);
  });

  beforeEach(async () => {
    usuario.clave = hashClave;
    jwtService = {
      signAsync: jest.fn(async (payload: { sub: string }, opciones?: object) =>
        opciones === undefined
          ? `acceso-${payload.sub}`
          : `refresh-${payload.sub}`,
      ),
      verifyAsync: jest.fn(),
    };
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
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn((clave: string) => clave) },
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
      clave: '12345678',
      perfil: { apellido: 'Gomez', ciudad: 'Bogota' },
    });

    expect(resultado.data.accessToken).toBe('acceso-nuevo-usuario');
    expect(resultado.data.refreshToken).toBe('refresh-nuevo-usuario');
    expect(resultado.data.usuario).toEqual({
      id: 'nuevo-usuario',
      nombre: 'Nicolas',
      correo: 'ana@correo.com',
      rol: 'estudiante',
    });
    expect(resultado.data.usuario).not.toHaveProperty('clave');
  });

  it('guarda la clave hasheada al registrar', async () => {
    usuarioRepository.findOneBy.mockResolvedValue(null);
    usuarioRepository.save.mockImplementation(async (u: Usuario) => u);

    await service.registrar({
      nombre: 'Ana',
      correo: 'ana@correo.com',
      clave: '12345678',
      perfil: { apellido: 'Gomez', ciudad: 'Bogota' },
    });

    const guardado = usuarioRepository.create.mock.calls[0][0] as Usuario;
    expect(guardado.clave).not.toBe('12345678');
    expect(await bcrypt.compare('12345678', guardado.clave)).toBe(true);
  });

  it('firma el access token con sub, correo y rol', async () => {
    usuarioRepository.findOneBy.mockResolvedValue(usuario);

    await service.login({ correo: usuario.correo, clave: '12345678' });

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, {
      sub: usuario.id,
      correo: usuario.correo,
      rol: 'estudiante',
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: usuario.id },
      { secret: 'JWT_REFRESH_SECRET', expiresIn: 'JWT_REFRESH_EXPIRES_IN' },
    );
  });

  it('inicia sesion con la clave correcta', async () => {
    usuarioRepository.findOneBy.mockResolvedValue(usuario);

    const resultado = await service.login({
      correo: usuario.correo,
      clave: '12345678',
    });

    expect(resultado.data.usuario.id).toBe(usuario.id);
  });

  it('rechaza una clave incorrecta', async () => {
    usuarioRepository.findOneBy.mockResolvedValue(usuario);

    await expect(
      service.login({ correo: usuario.correo, clave: 'incorrecta1' }),
    ).rejects.toThrow(UnauthorizedException);
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
        clave: '12345678',
        perfil: { apellido: 'Diaz', ciudad: 'Bogota' },
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rechaza un refresh token invalido', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt malformed'));

    await expect(service.refresh('basura')).rejects.toThrow(
      'Refresh token invalido',
    );
  });

  it('renueva los tokens con un refresh token valido', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: usuario.id });
    usuarioRepository.findOneBy.mockResolvedValue(usuario);

    const resultado = await service.refresh('token-valido');

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token-valido', {
      secret: 'JWT_REFRESH_SECRET',
    });
    expect(resultado.data.accessToken).toBe(`acceso-${usuario.id}`);
  });

  it('rechaza un refresh token de un usuario que ya no existe', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: usuario.id });
    usuarioRepository.findOneBy.mockResolvedValue(null);

    await expect(service.refresh('token-valido')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
