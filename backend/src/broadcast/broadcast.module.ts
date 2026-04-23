import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { BroadcastProcessor } from './broadcast.processor';
import { BullModule } from '@nestjs/bullmq';
import { WabaModule } from '../waba/waba.module';
import { BroadcastController } from './broadcast.controller';

@Module({
  imports: [
    WabaModule,
    BullModule.registerQueue({
      name: 'broadcast',
    }),
  ],
  providers: [BroadcastService, BroadcastProcessor],
  exports: [BroadcastService],
  controllers: [BroadcastController],
})
export class BroadcastModule {}
