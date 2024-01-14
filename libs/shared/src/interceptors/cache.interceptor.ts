import {
	CommonConfig,
	Cryptography,
	LibRedisService,
	RedisNS,
	utils,
} from '@app/shared';
import {
	CallHandler,
	ExecutionContext,
	Global,
	Inject,
	Injectable,
	Logger,
	NestInterceptor,
	OnModuleInit,
	mixin,
} from '@nestjs/common';
import { Request } from 'express';
import * as lodash from 'lodash';
import { Observable, map, of, tap } from 'rxjs';

function RedisCacheMixin(options?: RedisNS.UseCacheOptions) {
	@Global()
	@Injectable()
	class CacheInterceptor implements NestInterceptor, OnModuleInit {
		logger = new Logger(CacheInterceptor.name);
		prefix: string =
			options?.prefixKey ?? CommonConfig.REDIS_PREFIX_KEY_DEFAULT;
		@Inject()
		readonly redisService: LibRedisService;
		deletedCacheKeys: string[] = [];

		onModuleInit() {
			if (options?.ttl) {
				this.redisService.setTTL(options.ttl);
			}
		}

		async intercept(
			context: ExecutionContext,
			next: CallHandler<any>,
		): Promise<Observable<any>> {
			this.logger.log('************* Cache Interceptor **************');
			const request = context.switchToHttp().getRequest();
			const now = Date.now();
			const cacheData = await this.handleCacheData(request);
			if (this.isCached(request) && cacheData) {
				this.logger.log('*************** Response Cached Data *************');
				return of(cacheData).pipe(tap(() => this.logResponse(now)));
			}

			return next.handle().pipe(
				map((data) => {
					this.logger.log(
						'*************** Before Handle Cache Data *************',
					);
					this.handleCacheData(request, data);
					return data;
				}),
				tap(() => this.logResponse(now)),
			);
		}

		logResponse(before: number) {
			const responseTime = `After... ${Date.now() - before}ms`;
			const responseDeletedCacheKeys = this.deletedCacheKeys;
			const response = { responseTime, responseDeletedCacheKeys };
			console.log('responseDeletedCacheKeys::', responseDeletedCacheKeys);
			return this.logger.log(JSON.stringify(response));
		}

		isCached({ method, path }: Request) {
			if (method === 'GET' && this.excludeCached(path)) return true;
			return false;
		}

		excludeCached(path: string) {
			if (CommonConfig.REDIS_EXCLUDE_CACHE_PATH.includes(path)) return false;
			return true;
		}

		async handleCacheData(request: Request, data?: any) {
			this.logger.log('************* handleCache **************');

			const cacheKey = this.makeCacheKey(request);
			return await this.handleCacheByMethod(request, cacheKey, data);
		}

		async handleCacheByMethod(request: Request, cacheKey: string, data?: any) {
			switch (request.method) {
				case 'GET': {
					const currentCacheData = await this.redisService.get(cacheKey);
					if (currentCacheData) return currentCacheData;
					if (data) await this.redisService.set(cacheKey, data);
					return data;
				}
				case 'POST':
				case 'PUT': {
					await this.deleteRelatedCached(request, cacheKey);
					if (data) return await this.redisService.set(cacheKey, data);
					break;
				}
				case 'DELETE': {
					return await this.deleteRelatedCached(request, cacheKey);
				}
			}
		}

		async deleteRelatedCached(request: Request, cacheKey: string) {
			this.logger.log('************ deleteRelatedCached *************');
			this.deletedCacheKeys.push(cacheKey);

			const controller = this.getPathUrl(request.path)
				.split('/')
				.filter(Boolean)
				.at(0);

			const relatedKeys: string[] = (
				await Promise.all(
					[
						controller,
						...(CommonConfig.REDIS_RELATED_CONTROLLER_PATTERN?.[controller] ??
							[]),
					]
						.filter(Boolean)
						.map((key) => utils.generateCacheKey(this.prefix, key))
						.map(async (keyPattern: string) => {
							if (!String(keyPattern).endsWith('*')) {
								keyPattern += '*';
							}
							return (await this.redisService.scan(keyPattern)).keys;
						}),
				)
			).flat(1);
			this.deletedCacheKeys.push(...relatedKeys);
			this.deletedCacheKeys = lodash.uniq(this.deletedCacheKeys);
			await this.redisService.del(...this.deletedCacheKeys);
		}

		makeCacheKey(request: Request) {
			const pathUrl = this.getPathUrl(request.path);
			const pathUrlDelimiter = pathUrl
				.replace(/\/\//, '/')
				.split('/')
				.filter(Boolean)
				.join(CommonConfig.REDIS_DELIMITER);
			const hashedQuery = this.getHashedQuery(request.query);
			return utils.generateCacheKey(this.prefix, pathUrlDelimiter, hashedQuery);
		}

		getPathUrl(pathUrlIncludeGlobalPrefix: string) {
			return pathUrlIncludeGlobalPrefix.replace(/\/api\/v1/, '');
		}

		getHashedQuery(query: Request['query']) {
			delete query.created_by_user;
			delete query.updated_by_user;
			delete query.deleted_by_user;
			const queryString = Object.entries(query)
				.map(([key, val]) => `${key}=${val}`)
				.join('&');
			if (!queryString) return '';
			return String(Cryptography.generateMD5(queryString));
		}
	}

	return mixin(CacheInterceptor);
}

export default RedisCacheMixin;
