import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadAccesoJwt } from './auth.dto';
import { SolicitudAutenticada } from './jwt-auth.guard';

export const UsuarioActual = createParamDecorator(
  (_dato: unknown, context: ExecutionContext): PayloadAccesoJwt =>
    context.switchToHttp().getRequest<SolicitudAutenticada>().usuario,
);
