import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const respuesta = host.switchToHttp().getResponse();
    const codigo = (exception as QueryFailedError & { code?: string }).code;

    const error: HttpException =
      codigo === UNIQUE_VIOLATION
        ? new ConflictException('El registro ya existe')
        : codigo === FOREIGN_KEY_VIOLATION
          ? new ConflictException(
              'El registro esta relacionado con otros datos',
            )
          : new InternalServerErrorException();

    respuesta.status(error.getStatus()).json(error.getResponse());
  }
}
