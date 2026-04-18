import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Observable } from 'rxjs';

import { REQUEST_ID_HEADER } from '../constants/request.constants';
import { RequestContextService } from '../../infrastructure/logger/request-context.service';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  public constructor(private readonly requestContextService: RequestContextService) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user?: { sub?: string } }>();
    const response = context.switchToHttp().getResponse<{ setHeader: (name: string, value: string) => void }>();
    const requestId = request.headers[REQUEST_ID_HEADER] ?? randomUUID();

    response.setHeader(REQUEST_ID_HEADER, requestId);

    return this.requestContextService.run(
      {
        requestId,
        userId: request.user?.sub,
      },
      () => next.handle(),
    );
  }
}
