import { UseInterceptors, applyDecorators } from '@nestjs/common';
import RedisCacheMixin from '../interceptors/cache.interceptor';
import { RedisNS } from '../redis/types';

export const UseRedisCache = (options?: RedisNS.UseCacheOptions) =>
	applyDecorators(UseInterceptors(RedisCacheMixin(options)));
