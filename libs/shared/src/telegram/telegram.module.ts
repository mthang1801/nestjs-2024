import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from 'nestjs-telegram';
import { LibTelegramService } from './telegram.service';
import * as Joi from 'joi';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
			expandVariables: true,
			validationSchema: Joi.object({
				TELEGRAM_ENALBE_NOTI: Joi.boolean().required(),
			}),
		}),
		TelegramModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					botKey: configService.get<string>('TELEGRAM_BOT_ID'),
				};
			},
		}),
	],
	providers: [TelegramModule, LibTelegramService],
	exports: [TelegramModule, LibTelegramService],
})
export class LibTelegramModule {}
