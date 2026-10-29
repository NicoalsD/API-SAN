import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { AuthResponseDto, LoginDto, RegistroDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
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
      this.usuarioRepository.create(datos),
    );

    return {
      message: 'Usuario registrado correctamente',
      data: this.generarTokens(nuevoUsuario),
    };
  }

  async login(datos: LoginDto) {
    const usuario = await this.usuarioRepository.findOneBy({
      correo: datos.correo,
    });
    if (usuario === null || usuario.clave !== datos.clave) {
      throw new UnauthorizedException('Correo o clave incorrectos');
    }

    return {
      message: 'Ingreso exitoso',
      data: this.generarTokens(usuario),
    };
  }

  async refresh(refreshToken: string) {
    const id = refreshToken.replace('refresh-', '');
    if (!isUUID(id)) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (usuario === null) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    return {
      message: 'Token renovado',
      data: this.generarTokens(usuario),
    };
  }

  private generarTokens(usuario: Usuario): AuthResponseDto {
    return {
      accessToken: `token-${usuario.id}`,
      refreshToken: `refresh-${usuario.id}`,
    };
  }
}
