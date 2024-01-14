import {
  CommonConfig,
  LibTelegramService,
  RMQService,
  SwaggerSetupOptions,
} from '@app/shared';
import { CommonConfigType } from '@app/shared/config/types';
import { MorganLogger } from '@app/shared/logger/morgan.logger';
import { WinstonLogger } from '@app/shared/logger/winston.logger';
import { SetupSwagger } from '@app/shared/swagger/setup';
import { Logger, NestModule, ValidationPipe } from '@nestjs/common';
import {
  GlobalPrefixOptions,
  RouteInfo,
  VersioningOptions,
} from '@nestjs/common/interfaces';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import mongoose from 'mongoose';
import { IApplication } from './appliaction.interface';
class Application implements IApplication {
	private logger = new Logger(Application.name);
	private app: NestExpressApplication;
	private AppModule: NestModule;
	private serviceName: string;
	private morganLogger: any;
	private validationPipe: ValidationPipe;
	private globalPrefix: string;
	private globalPrefixOptions: GlobalPrefixOptions<string | RouteInfo> = {};
	private versioningOptions: VersioningOptions;
	private swaggerOptions: SwaggerSetupOptions;
	private RMQConsummerQueues: string[];
	private portENV: string;
	private enableMongooseLog: boolean = true;
	private corsOptions: CorsOptions = {
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	};
	constructor(AppModule: any, service: CommonConfigType.NestService) {
		this.AppModule = AppModule;
		this.serviceName = service.name;
		this.portENV = service.portENV;
	}

	useMorganLogger() {
		this.morganLogger = MorganLogger();
		return this;
	}

	useGlobalPipes(validationPipe?: ValidationPipe) {
		this.validationPipe = validationPipe;
		return this;
	}

	enableCors(options?: CorsOptions) {
		this.corsOptions = options ?? this.corsOptions;
		return this;
	}

	setGlobalPrefix(
		prefix: string,
		options: GlobalPrefixOptions<string | RouteInfo>,
	) {
		this.globalPrefix = prefix;
		this.globalPrefixOptions = options;
		return this;
	}

	enableVersioning(versioningOptions: VersioningOptions) {
		this.versioningOptions = versioningOptions;
		return this;
	}

	private viewEngine() {
		this.app.useStaticAssets(CommonConfig.STATIC_ASSET);
		this.app.setBaseViewsDir(CommonConfig.STATIC_VIEWS);
		this.app.setViewEngine('hbs');
	}

	setSwaggerDocument(options?: SwaggerSetupOptions) {
		this.swaggerOptions = options;
		return this;
	}

	setDefault() {
		this.useMorganLogger();
		this.enableCors();
		this.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				transform: true,
			}),
		);
		return this;
	}

	toggleMongooseLog(bool: boolean) {
		this.enableMongooseLog = bool;
		return this;
	}

	setRMQConsumers(...queues: string[]) {
		this.RMQConsummerQueues = queues.flat(1).filter(Boolean);
		return this;
	}

	async startAllMicroservices() {
		if (!this.RMQConsummerQueues) return;
		const rmqClientService = this.app.get<RMQService>(RMQService);
		this.RMQConsummerQueues.flat(1).map((queue) => {
			return this.app.connectMicroservice(
				rmqClientService.getConsumer({
					queue,
					prefetchCount: CommonConfig.RMQGetPrefetchCount(queue),
					isAck: CommonConfig.RMQ_ACK_QUEUES.includes(queue),
				}),
			);
		});
		await this.app.startAllMicroservices();
		return this;
	}

	private async listen() {
		const configService = this.app.get<ConfigService>(ConfigService);
		console.log(this.portENV, configService.get<number>(this.portENV));

		const telegramService =
			this.app.get<LibTelegramService>(LibTelegramService);
		await this.app.listen(configService.get<number>(this.portENV), async () => {
			this.logger.log(`Server is running on ${await this.app.getUrl()}`);
			await telegramService.sendMessage(
				`🔥[${this.serviceName}] is running on ${await this.app.getUrl()}`,
			);
		});
	}

	async init() {
		this.app = await NestFactory.create<NestExpressApplication>(
			this.AppModule,
			{
				logger: WinstonLogger(this.serviceName),
			},
		);
		this.app.use(express.json({ limit: '50mb' }));
		this.morganLogger && this.app.use(this.morganLogger);
		this.validationPipe && this.app.useGlobalPipes(this.validationPipe);
		this.corsOptions && this.app.enableCors(this.corsOptions);
		this.globalPrefix &&
			this.app.setGlobalPrefix(this.globalPrefix, this.globalPrefixOptions);
		this.versioningOptions && this.app.enableVersioning(this.versioningOptions);
		this.viewEngine();
		this.swaggerOptions && SetupSwagger(this.app, this.swaggerOptions);
		this.enableMongooseLog && mongoose.set('debug', true);
		await this.startAllMicroservices();
		await this.listen();
		return this.app;
	}
}

export default Application;
