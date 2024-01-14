import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { LibCoreModule } from '../core/core.module';

@Module({
	imports: [
		forwardRef(() => LibCoreModule),
		ThrottlerModule.forRootAsync({
			useFactory: (configService: ConfigService) => {
				const host = configService.get('REDIS_HOST');
				const port = configService.get('REDIS_PORT');
				const password = configService.get('REDIS_PASSWORD');
				const username = configService.get('REDIS_USERNAME');
				const redisUri = `redis://${username}:${password}@${host}:${port}`;

				return {
					throttlers: [
						{
							ttl: seconds(Number(configService.get('THROTTLER_TTL'))),
							limit: Number(configService.get('THROTTLER_LIMIT')),
						},
					],
					storage: new ThrottlerStorageRedisService(redisUri),
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [],
	exports: [ThrottlerModule],
})
export class LibThrottlerModule {}
