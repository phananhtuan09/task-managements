import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  public constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.getOrThrow<string>('redis.host'),
      port: configService.getOrThrow<number>('redis.port'),
      db: configService.getOrThrow<number>('redis.db'),
      username: configService.get<string>('redis.username'),
      password: configService.get<string>('redis.password'),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  public async ping(): Promise<string> {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }

    return this.client.ping();
  }

  public getClient(): Redis {
    return this.client;
  }

  public async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
