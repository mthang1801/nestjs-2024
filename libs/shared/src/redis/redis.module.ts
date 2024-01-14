import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonConfig } from '../config/common.config';
import { RedisModuleAsyncOptions, RedisOptionFactory } from './interfaces';
import { LibRedisService } from './redis.service';
import { LibRedisUtil } from './redis.utils';

@Global()
@Module({
	imports: [],
	providers: [LibRedisService],
	exports: [LibRedisService],
})
export class LibRedisModule {
	static registerAsync(
		connectionOptions: RedisModuleAsyncOptions,
	): DynamicModule {
		return {
			module: LibRedisModule,
			imports: connectionOptions.imports || [
				ConfigModule.forRoot({
					isGlobal: true,
					envFilePath:
						process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
					expandVariables: true,
				}),
			],
			providers: [
				LibRedisUtil,
				LibRedisService,
				connectionOptions.useClass ?? undefined,
				connectionOptions.useExisting ?? undefined,
				this.createConnectionProvider(connectionOptions),
				this.createConnectFactory(),
			].filter(Boolean),
			exports: [LibRedisService],
		};
	}

	static createConnectionProvider(
		connectionOptions: RedisModuleAsyncOptions,
	): Provider {    
		if (connectionOptions.useFactory) {
			return {
				provide: CommonConfig.NEST_TOKEN.REDIS_CONNECTION_OPTIONS,
				useFactory: connectionOptions.useFactory,
				inject: connectionOptions.inject ?? [],
			};
		}

		return {
			provide: CommonConfig.NEST_TOKEN.REDIS_CONNECTION_OPTIONS,
			useFactory: async (optionFactory: RedisOptionFactory) =>
				optionFactory.createRedisConnection(),
			inject: [
				connectionOptions.useClass ?? connectionOptions.useExisting,
			].filter(Boolean),
		};
	}

	static createConnectFactory(): Provider {
		return {
			provide: CommonConfig.NEST_TOKEN.REDIS,
			useFactory: async (redisService: LibRedisService) =>
				await redisService.connect(),
			inject: [LibRedisService],
		};
	}
}
