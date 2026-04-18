import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

export const DEFAULT_QUEUE_NAME = 'default';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: DEFAULT_QUEUE_NAME,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
