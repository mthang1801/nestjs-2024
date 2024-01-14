import { User, UserSchema, UserSchemaFactory } from '@app/common/schemas';
import { CommonConfig, LibMongoModule, LibRabbitMQModule } from '@app/shared';
import { LibMailModule } from '@app/shared/mail/mail.module';
import { Global, Module, forwardRef } from '@nestjs/common';
import { LibAuthModule } from '../auth/auth.module';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { LibRoleModule } from '../role/role.module';
@Global()
@Module({
	imports: [
		LibMailModule,
		forwardRef(() => LibAuthModule),
    forwardRef(() => LibRoleModule),
		LibMongoModule.forFeatureAsync({
			name: User.name,
			schema: UserSchema,
			useFactory: UserSchemaFactory,
		}),
		LibRabbitMQModule.registerAsync({
			name: CommonConfig.RMQ_QUEUES.MAIL_SERVICE,
		}),
	],
	providers: [UserService, UserRepository],
	exports: [UserService, UserRepository],
})
export class LibUserModule {}
