import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino, { Logger } from 'pino';

import { RequestContextService } from './request-context.service';

interface HttpLogPayload {
  readonly method: string;
  readonly path: string;
  readonly statusCode: number;
  readonly durationMs: number;
  readonly requestId?: string;
  readonly userId?: string;
}

interface ExceptionLogPayload {
  readonly method?: string;
  readonly path?: string;
  readonly statusCode: number;
  readonly code: string;
  readonly message: string | string[];
  readonly details?: unknown;
  readonly stack?: string;
  readonly requestId?: string;
  readonly userId?: string;
}

interface PrismaQueryLogPayload {
  readonly query: string;
  readonly params: string;
  readonly durationMs: number;
  readonly target: string;
  readonly requestId?: string;
  readonly userId?: string;
}

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: Logger;

  public constructor(
    private readonly requestContextService: RequestContextService,
    private readonly configService: ConfigService,
  ) {
    this.logger = pino({
      level: this.configService.get<string>('NODE_ENV') === 'production' ? 'info' : 'debug',
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label }),
      },
    });
  }

  public log(message: string, context?: string): void {
    this.logger.info(this.withContext(context), message);
  }

  public error(message: string, trace?: string, context?: string): void {
    this.logger.error(this.withContext(context, { trace }), message);
  }

  public warn(message: string, context?: string): void {
    this.logger.warn(this.withContext(context), message);
  }

  public debug(message: string, context?: string): void {
    this.logger.debug(this.withContext(context), message);
  }

  public verbose(message: string, context?: string): void {
    this.logger.trace(this.withContext(context), message);
  }

  public logHttp(payload: HttpLogPayload): void {
    this.logger.info(payload, 'http_request_completed');
  }

  public warnHttp(payload: HttpLogPayload): void {
    this.logger.warn(payload, 'http_request_failed');
  }

  public logException(payload: ExceptionLogPayload): void {
    this.logger.error(payload, 'http_exception_caught');
  }

  public logPrismaQuery(payload: PrismaQueryLogPayload): void {
    this.logger.debug(payload, 'prisma_query_executed');
  }

  private withContext(context?: string, extra?: Record<string, unknown>): Record<string, unknown> {
    return {
      context,
      requestId: this.requestContextService.getRequestId(),
      userId: this.requestContextService.getUserId(),
      ...extra,
    };
  }
}
