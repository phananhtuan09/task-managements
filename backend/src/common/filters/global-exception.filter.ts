import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import {
  APP_ERROR_CODE,
  TRANSLATED_ERROR_CODES,
  type AppErrorCode,
} from '../constants/error.constants';
import { AppI18nService } from '../../i18n/app-i18n.service';
import { AppLoggerService } from '../../infrastructure/logger/app-logger.service';
import { RequestContextService } from '../../infrastructure/logger/request-context.service';

interface ErrorPayload {
  readonly code: AppErrorCode | string;
  readonly message: string;
  readonly details?: unknown;
  readonly error?: unknown;
  readonly stack?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public constructor(
    private readonly requestContextService: RequestContextService,
    private readonly logger: AppLoggerService,
    private readonly appI18nService: AppI18nService,
    private readonly configService: ConfigService,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = this.buildPayload(exception);

    this.logger.logException({
      method: request.method,
      path: request.url,
      statusCode: status,
      code: payload.code,
      message: payload.message,
      details: payload.details,
      stack: exception instanceof Error ? exception.stack : undefined,
      requestId: this.requestContextService.getRequestId(),
      userId: this.requestContextService.getUserId(),
    });

    response.status(status).json({
      success: false,
      code: payload.code,
      message: payload.message,
      ...(this.shouldIncludeDebug(request)
        ? {
            details: payload.details,
            error: payload.error,
            stack: payload.stack,
          }
        : {}),
      path: request.url,
      requestId: this.requestContextService.getRequestId(),
      timestamp: new Date().toISOString(),
    });
  }

  private buildPayload(exception: unknown): ErrorPayload {
    if (!(exception instanceof HttpException)) {
      return {
        code: APP_ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: this.appI18nService.t('errors.INTERNAL_SERVER_ERROR'),
        stack: exception instanceof Error ? exception.stack : undefined,
      };
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        code: this.getDefaultCode(exception.getStatus()),
        message: this.toUserMessage(response, exception.getStatus()),
        stack: exception.stack,
      };
    }

    if (typeof response === 'object' && response !== null) {
      const responseObject = response as Record<string, unknown>;

      return {
        code:
          (responseObject.code as AppErrorCode | string | undefined) ??
          this.getDefaultCode(exception.getStatus()),
        message: this.toUserMessage(
          responseObject.message as string | string[] | undefined,
          exception.getStatus(),
        ),
        details: responseObject.details,
        error: responseObject.error,
        stack: exception.stack,
      };
    }

    return {
      code: this.getDefaultCode(exception.getStatus()),
      message: this.getTranslatedStatusMessage(exception.getStatus()),
    };
  }

  private getDefaultCode(status: number): string {
    return HttpStatus[status] ?? APP_ERROR_CODE.HTTP_EXCEPTION;
  }

  private getTranslatedStatusMessage(status: number): string {
    const code = this.getDefaultCode(status);

    if (!this.isTranslatedErrorCode(code)) {
      return HttpStatus[status] ?? APP_ERROR_CODE.HTTP_EXCEPTION;
    }

    return this.appI18nService.t(`errors.${code}`);
  }

  private isTranslatedErrorCode(
    code: string,
  ): code is keyof import('../../generated/i18n.generated').I18nTranslations['errors'] {
    return TRANSLATED_ERROR_CODES.includes(
      code as (typeof TRANSLATED_ERROR_CODES)[number],
    );
  }

  private toUserMessage(message: string | string[] | undefined, status: number): string {
    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }

    if (Array.isArray(message)) {
      const firstMessage = message.find(
        (item) => typeof item === 'string' && item.trim() !== '',
      );

      if (firstMessage) {
        return firstMessage;
      }
    }

    return this.getTranslatedStatusMessage(status);
  }

  private shouldIncludeDebug(request: Request): boolean {
    const debugKey = this.configService.get<string>('app.error.debugKey');

    if (!debugKey) {
      return false;
    }

    const debugHeader = this.configService.getOrThrow<string>('app.error.debugHeader');
    const headerValue = request.headers[debugHeader];
    const normalizedHeaderValue = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;

    return normalizedHeaderValue === debugKey;
  }
}
