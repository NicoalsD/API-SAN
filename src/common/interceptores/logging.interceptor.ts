import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const { method, url } = http.getRequest<Request>();
    const inicio = Date.now();

    const registrar = (status: number) =>
      this.logger.log(`${method} ${url} ${status} - ${Date.now() - inicio}ms`);

    return next.handle().pipe(
      tap({
        next: () => registrar(http.getResponse<Response>().statusCode),
        error: (error: unknown) =>
          registrar(error instanceof HttpException ? error.getStatus() : 500),
      }),
    );
  }
}
