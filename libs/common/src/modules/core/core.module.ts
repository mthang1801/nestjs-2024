import { AllExceptionsFilter } from '@app/shared/filter/all-exception.filter';
import { LibHttpModule } from '@app/shared/http/http.module';
import { LibI18nModule } from '@app/shared/i18n';
import { TransformInterceptor } from '@app/shared/interceptors/transform.interceptor';
import { LibMongoModule } from '@app/shared/mongodb';
import { LibRedisModule } from '@app/shared/redis';
import { LibTelegramModule } from '@app/shared/telegram/telegram.module';
import { Global, Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { LibActionHistoryModule } from '../action-history';
import { LibLogModule } from '../log/log.module';
import { LibThrottlerModule } from '../throttler/throttler.module';
import { LibRabbitMQModule } from '@app/shared';

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
			expandVariables: true,
			validationSchema: Joi.object({
				NODE_ENV: Joi.valid('development', 'production').required(),
				TELEGRAM_ENALBE_NOTI: Joi.boolean().optional(),
			}),
		}),
		LibRabbitMQModule,
		LibTelegramModule,
		LibI18nModule,
		LibMongoModule.forRootAsync(),
		JwtModule.register({}),
		LibHttpModule,
		ScheduleModule.forRoot(),
		LibRedisModule.registerAsync({
			useFactory: (configService: ConfigService): any => {
				return {
					host: configService.get('REDIS_HOST'),
					port: configService.get('REDIS_PORT'),
					username: configService.get('REDIS_USERNAME' || undefined),
					password: configService.get('REDIS_PASSWORD' || undefined),
				};
			},
			inject: [ConfigService],
		}),
		forwardRef(() => LibActionHistoryModule),
		forwardRef(() => LibLogModule),
		forwardRef(() => LibThrottlerModule),
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
	],
	exports: [
		ConfigModule,
		LibMongoModule,
		LibTelegramModule,
		JwtModule,
		LibHttpModule,
		ScheduleModule,
	],
})
export class LibCoreModule {}
