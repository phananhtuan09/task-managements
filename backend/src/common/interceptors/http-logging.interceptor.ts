import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { AppLoggerService } from '../../infrastructure/logger/app-logger.service';
import { RequestContextService } from '../../infrastructure/logger/request-context.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  public constructor(
    private readonly logger: AppLoggerService,
    private readonly requestContextService: RequestContextService,
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.logHttp({
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
            requestId: this.requestContextService.getRequestId(),
            userId: this.requestContextService.getUserId(),
          });
        },
        error: (error: unknown) => {
          const statusCode =
            error instanceof HttpException
              ? error.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR;

          this.logger.warnHttp({
            method: request.method,
            path: request.originalUrl,
            statusCode,
            durationMs: Date.now() - startedAt,
            requestId: this.requestContextService.getRequestId(),
            userId: this.requestContextService.getUserId(),
          });
        },
      }),
    );
  }
}
