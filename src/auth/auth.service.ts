import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResponseDto, LoginDto, RegistroDto } from './auth.dto';

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  clave: string;
}

@Injectable()
export class AuthService {
  private usuarios: Usuario[] = [
    {
      id: '1',
      nombre: 'Nicolas',
      correo: 'nicolas@correo.com',
      clave: '123456',
    },
  ];

  registrar(datos: RegistroDto) {
    const nuevoUsuario: Usuario = {
      id: `${new Date().getTime()}`,
      ...datos,
    };
    this.usuarios.push(nuevoUsuario);

    return {
      message: 'Usuario registrado correctamente',
      data: this.generarTokens(nuevoUsuario),
    };
  }

  login(datos: LoginDto) {
    const usuario = this.usuarios.find(
      (usuario) => usuario.correo === datos.correo,
    );
    if (usuario === undefined || usuario.clave !== datos.clave) {
      throw new UnauthorizedException('Correo o clave incorrectos');
    }

    return {
      message: 'Ingreso exitoso',
      data: this.generarTokens(usuario),
    };
  }

  refresh(refreshToken: string) {
    const id = refreshToken.replace('refresh-', '');
    const usuario = this.usuarios.find((usuario) => usuario.id === id);
    if (usuario === undefined) {
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