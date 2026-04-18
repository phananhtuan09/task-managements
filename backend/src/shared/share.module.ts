import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { I18nJsonLoader, I18nModule, AcceptLanguageResolver, HeaderResolver } from 'nestjs-i18n';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { PrismaModule } from '../database/prisma/prisma.module';
import { CacheModule } from '../infrastructure/cache/cache.module';
import { LoggerModule } from '../infrastructure/logger/logger.module';
import { QueueModule } from '../infrastructure/queue/queue.module';
import { ScheduleInfraModule } from '../infrastructure/schedule/schedule.module';
import { appConfigurations } from '../config';
import { validateEnv } from '../config/env.schema';
import { AppI18nService } from '../i18n/app-i18n.service';
import { UserLanguageResolver } from '../i18n/resolvers/user-language.resolver';

function getI18nPath(): string {
  const sourcePath = join(process.cwd(), 'src', 'i18n');

  if (existsSync(sourcePath)) {
    return sourcePath;
  }

  return join(process.cwd(), 'dist', 'i18n');
}

function getI18nTypesOutputPath(): string {
  return join(process.cwd(), 'src', 'generated', 'i18n.generated.ts');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateEnv,
      load: appConfigurations,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>('app.throttle.ttl'),
          limit: configService.getOrThrow<number>('app.throttle.limit'),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow<string>('app.defaultLang'),
        loader: I18nJsonLoader,
        loaderOptions: {
          path: getI18nPath(),
          watch: true,
        },
        typesOutputPath: getI18nTypesOutputPath(),
      }),
      resolvers: [
        UserLanguageResolver,
        {
          use: HeaderResolver,
          options: ['x-lang'],
        },
        {
          use: AcceptLanguageResolver,
          options: {
            matchType: 'strict-loose',
          },
        },
      ],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.getOrThrow<string>('redis.host'),
          port: configService.getOrThrow<number>('redis.port'),
          db: configService.getOrThrow<number>('redis.db'),
          username: configService.get<string>('redis.username'),
          password: configService.get<string>('redis.password'),
        },
      }),
    }),
    LoggerModule,
    CacheModule,
    QueueModule,
    ScheduleInfraModule,
    PrismaModule,
  ],
  providers: [AppI18nService, UserLanguageResolver],
  exports: [
    ConfigModule,
    ThrottlerModule,
    ScheduleModule,
    EventEmitterModule,
    BullModule,
    LoggerModule,
    CacheModule,
    QueueModule,
    ScheduleInfraModule,
    PrismaModule,
    I18nModule,
    AppI18nService,
  ],
})
export class ShareModule {}
