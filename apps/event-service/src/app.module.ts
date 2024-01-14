import { LibCoreModule } from '@app/common/modules';
import { LibRabbitMQModule } from '@app/shared';
import { Module } from '@nestjs/common';
import { ActionHistoryModule } from './action-history/action-history.module';
import { InfoDataModule } from './info-data/info-data.module';
import { LogModule } from './log/log.module';
import { MailModule } from './mail/mail.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
	imports: [
		LibCoreModule,
		MailModule,
		InfoDataModule,
		SchedulerModule,
		LogModule,
		ActionHistoryModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
