import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Env } from '../env.model';
import { Usuario } from '../usuarios/usuario.entity';
import {
  AuthResponseDto,
  LoginDto,
  PayloadAccesoJwt,
  PayloadRefreshJwt,
  RegistroDto,
} from './auth.dto';

const RONDAS_HASH = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>,
  ) {}

  async registrar(datos: RegistroDto) {
    const existente = await this.usuarioRepository.findOneBy({
      correo: datos.correo,
    });
    if (existente !== null) {
      throw new ConflictException(
        `El correo ${datos.correo} ya esta registrado`,
      );
    }

    const nuevoUsuario = await this.usuarioRepository.save(
      this.usuarioRepository.create({
        ...datos,
        clave: await bcrypt.hash(datos.clave, RONDAS_HASH),
      }),
    );

    return {
      message: 'Usuario registrado correctamente',
      data: await this.generarTokens(nuevoUsuario),
    };
  }

  async login(datos: LoginDto) {
    const usuario = await this.usuarioRepository.findOneBy({
      correo: datos.correo,
    });
    if (
      usuario === null ||
      !(await bcrypt.compare(datos.clave, usuario.clave))
    ) {
      throw new UnauthorizedException('Correo o clave incorrectos');
    }

    return {
      message: 'Ingreso exitoso',
      data: await this.generarTokens(usuario),
    };
  }

  async refresh(refreshToken: string) {
    let payload: PayloadRefreshJwt;
    try {
      payload = await this.jwtService.verifyAsync<PayloadRefreshJwt>(
        refreshToken,
        { secret: this.configService.getOrThrow('JWT_REFRESH_SECRET') },
      );
    } catch {
      throw new UnauthorizedException('Refresh token invalido');
    }

    const usuario = await this.usuarioRepository.findOneBy({
      id: payload.sub,
    });
    if (usuario === null) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    return {
      message: 'Token renovado',
      data: await this.generarTokens(usuario),
    };
  }

  private async generarTokens(usuario: Usuario): Promise<AuthResponseDto> {
    const payloadAcceso: PayloadAccesoJwt = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };
    const payloadRefresh: PayloadRefreshJwt = { sub: usuario.id };

    return {
      accessToken: await this.jwtService.signAsync(payloadAcceso),
      refreshToken: await this.jwtService.signAsync(payloadRefresh, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      }),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }
}
