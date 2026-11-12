import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PayloadAccesoJwt } from './auth.dto';

export type SolicitudAutenticada = Request & { usuario: PayloadAccesoJwt };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const solicitud = context.switchToHttp().getRequest<SolicitudAutenticada>();
    const [tipo, token] = (solicitud.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    try {
      solicitud.usuario =
        await this.jwtService.verifyAsync<PayloadAccesoJwt>(token);
    } catch {
      throw new UnauthorizedException('Token de acceso invalido o expirado');
    }
    return true;
  }
}
