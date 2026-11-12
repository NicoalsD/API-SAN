import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { SolicitudAutenticada } from './jwt-auth.guard';

/** Solo el propio usuario (o un admin) accede a `/usuarios/:id...`. Va despues de JwtAuthGuard. */
@Injectable()
export class PropietarioGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const solicitud = context
      .switchToHttp()
      .getRequest<SolicitudAutenticada & { params: { id?: string } }>();
    const { usuario, params } = solicitud;
    if (usuario === undefined) {
      throw new ForbiddenException('No tienes permisos para esta accion');
    }
    if (usuario.rol !== 'admin' && usuario.sub !== params.id) {
      throw new ForbiddenException(
        'No puedes acceder a los datos de otro usuario',
      );
    }
    return true;
  }
}
