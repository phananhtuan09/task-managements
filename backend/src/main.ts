import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { setupApp } from './bootstrap/setup-app';
import { setupSwagger } from './bootstrap/setup-swagger';
import { setupValidation } from './bootstrap/setup-validation';
import { AppLoggerService } from './infrastructure/logger/app-logger.service';

function registerProcessErrorHandlers(logger: AppLoggerService): void {
  process.on('uncaughtException', (error) => {
    logger.error(
      error.message,
      error.stack,
      'UncaughtException',
    );
  });

  process.on('unhandledRejection', (reason) => {
    const error =
      reason instanceof Error ? reason : new Error(`Unhandled rejection: ${String(reason)}`);

    logger.error(error.message, error.stack, 'UnhandledRejection');
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLoggerService);
  app.useLogger(logger);
  registerProcessErrorHandlers(logger);

  setupValidation(app);
  setupApp(app);
  setupSwagger(app);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');

  await app.listen(port);

  logger.log(`HTTP server started on port ${String(port)}`, 'Bootstrap');
}

void bootstrap();
