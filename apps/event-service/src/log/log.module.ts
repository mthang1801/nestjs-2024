import { LibLogModule } from '@app/common/modules/log/log.module';
import { Module } from '@nestjs/common';
import { LogController } from './log.controller';

@Module({
  imports : [LibLogModule],
  controllers: [LogController]
})
export class LogModule {}
