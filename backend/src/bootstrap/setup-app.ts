import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import { GlobalExceptionFilter } from '../common/filters/global-exception.filter';
import { HttpLoggingInterceptor } from '../common/interceptors/http-logging.interceptor';
import { RequestContextInterceptor } from '../common/interceptors/request-context.interceptor';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';

export function setupApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.getOrThrow<string>('app.globalPrefix'));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: configService.getOrThrow<string>('app.corsOrigin').split(','),
    credentials: true,
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.useGlobalFilters(app.get(GlobalExceptionFilter));
  app.useGlobalInterceptors(
    app.get(RequestContextInterceptor),
    app.get(HttpLoggingInterceptor),
    app.get(TransformResponseInterceptor),
  );
}
