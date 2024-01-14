import { CommonConfig, LibRabbitMQModule } from '@app/shared';
import { Module, forwardRef } from '@nestjs/common';
import { LibCoreModule } from '../core/core.module';
import { LibUserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
	imports: [
		LibCoreModule,
		forwardRef(() => LibUserModule),
		LibRabbitMQModule.registerAsync({ name: CommonConfig.RMQ_QUEUES.MAIL_SERVICE }),
	],
	providers: [AuthService, LocalStrategy],
	exports: [AuthService, LocalStrategy],
})
export class LibAuthModule {}
