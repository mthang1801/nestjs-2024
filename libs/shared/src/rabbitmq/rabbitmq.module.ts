import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQService } from './rabbitmq.service';
import { RMQDynamicModuleOptions } from './types/rabbitmq-dynamic-module-options.type';
@Global()
@Module({
	providers: [RMQService],
	exports: [RMQService],
})
export class LibRabbitMQModule {
	static registerAsync({ name }: RMQDynamicModuleOptions): DynamicModule {
		return {
			module: LibRabbitMQModule,
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					envFilePath:
						process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
					expandVariables: true,
				}),

				ClientsModule.registerAsync([
					{
						name: name,
						useFactory: (configService: ConfigService) => {
              console.log(configService.get<string>('RMQ_URI'))
							return {
								transport: Transport.RMQ,
								options: {
									urls: [configService.get<string>('RMQ_URI')],
									queue: name,
									queueOptions: {
										durable: true,
									},
									socketOptions: {
										noDelay: true,
										retryAttempts: 5,
										retryDelay: 10,
										heartbeatIntervalInSeconds: 60,
										reconnectTimeInSeconds: 5,
									},
								},
							};
						},
						inject: [ConfigService],
					},
				]),
			],
			exports: [RMQService, ClientsModule],
		};
	}
}
