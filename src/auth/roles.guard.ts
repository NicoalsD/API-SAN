import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../common/constantes';
import { SolicitudAutenticada } from './jwt-auth.guard';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (roles === undefined || roles.length === 0) {
      return true;
    }

    const { usuario } = context
      .switchToHttp()
      .getRequest<SolicitudAutenticada>();
    if (usuario === undefined || !roles.includes(usuario.rol)) {
      throw new ForbiddenException('No tienes permisos para esta accion');
    }
    return true;
  }
}
