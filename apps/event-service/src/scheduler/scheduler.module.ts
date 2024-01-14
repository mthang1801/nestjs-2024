import { LibCoreModule } from '@app/common';
import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Module({
  imports : [LibCoreModule],
  providers : [SchedulerService]
})
export class SchedulerModule {}
