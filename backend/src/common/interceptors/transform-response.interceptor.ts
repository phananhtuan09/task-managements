import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

import type { PaginateResult } from '../../database/base/base.repository.types';
import { AppI18nService } from '../../i18n/app-i18n.service';
import { RequestContextService } from '../../infrastructure/logger/request-context.service';
import { ApiResponse } from '../responses/api-response.class';
import { PaginatedResponse } from '../responses/paginated-response.class';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  public constructor(
    private readonly requestContextService: RequestContextService,
    private readonly appI18nService: AppI18nService,
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<{ headersSent?: boolean }>();

    return next.handle().pipe(
      map((value) => {
        if (response.headersSent || value instanceof StreamableFile) {
          return value;
        }

        if (this.isWrappedResponse(value)) {
          return value;
        }

        if (this.isPaginateResult(value)) {
          return new PaginatedResponse(
            value.data,
            value.total,
            value.page,
            value.limit,
            this.requestContextService.getRequestId(),
          );
        }

        return new ApiResponse(
          value,
          this.appI18nService.t('common.ok'),
          this.requestContextService.getRequestId(),
        );
      }),
    );
  }

  private isWrappedResponse(value: unknown): boolean {
    return typeof value === 'object' && value !== null && 'success' in value;
  }

  private isPaginateResult(value: unknown): value is PaginateResult<unknown> {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      Array.isArray(candidate.data) &&
      typeof candidate.total === 'number' &&
      typeof candidate.page === 'number' &&
      typeof candidate.limit === 'number'
    );
  }
}
