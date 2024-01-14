import { LibActionHistoryModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ActionHistoryController } from './action-history.controller';

@Module({
	imports: [LibActionHistoryModule],
	controllers: [ActionHistoryController],
})
export class ActionHistoryModule {}
