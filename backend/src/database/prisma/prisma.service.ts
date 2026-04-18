import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';

import { AppLoggerService } from '../../infrastructure/logger/app-logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public constructor(
    configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('database.url'),
    });

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  public async onModuleInit(): Promise<void> {
    this.$on('query' as never, (event: Prisma.QueryEvent) => {
      this.logger.logPrismaQuery({
        query: event.query,
        params: event.params,
        durationMs: event.duration,
        target: event.target,
      });
    });

    await this.$connect();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
