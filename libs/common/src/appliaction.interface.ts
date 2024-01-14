import { SwaggerSetupOptions } from '@app/shared';
import { ValidationPipe } from '@nestjs/common';
import {
	GlobalPrefixOptions,
	RouteInfo,
	VersioningOptions,
} from '@nestjs/common/interfaces';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';

export interface IApplication {
	useMorganLogger(): this;
	useGlobalPipes(validationPipe: ValidationPipe): this;
	enableCors(corsOptions: CorsOptions): this;
	setGlobalPrefix(
		prefix: string,
		options: GlobalPrefixOptions<string | RouteInfo>,
	): this;
	enableVersioning(versioningOptions: VersioningOptions): this;
	setSwaggerDocument(options?: SwaggerSetupOptions): this;
	setDefault(): this;
	toggleMongooseLog(bool: boolean): this;
	setRMQConsumers(...queues: string[]): this;
	init(): Promise<NestExpressApplication>;
}
