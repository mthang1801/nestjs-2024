import { LoggerService } from '@nestjs/common';
import { GlobalPrefixOptions, RouteInfo } from '@nestjs/common/interfaces';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

export class Application {
	private app: NestExpressApplication;
	private AppModule: any;
	private corsOptions = {
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	};
	constructor(AppModule) {
		this.AppModule = AppModule;
	}

	async initialize() {
		this.app = await NestFactory.create<NestExpressApplication>(
			this.AppModule,
			{ cors: this.corsOptions },
		);
		return this;
	}

	useLogger(logger: LoggerService) {
		this.app.useLogger = logger as any;
		return this;
	}

	use(...args: any[]) {
		this.app.use(args);
		return this;
	}

	enableCors(options: CorsOptions) {
		this.app.enable(options);
		return this;
	}

	setGlobalPrefix(
		prefix: string,
		options?: GlobalPrefixOptions<string | RouteInfo>,
	) {
		this.app.setGlobalPrefix(prefix, options);
	}

	async bootstrap() {
		return this;
	}
}
